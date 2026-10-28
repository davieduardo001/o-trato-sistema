// Estado global do Service Desk. Chamados e Base de Conhecimento persistem em localStorage.
import { useState, useEffect } from '../vendor/htm-preact.js';
import { SEED, KB, USERS, THEME_META, SCALES, nowStr, mkHistory as h } from './data.js';

const A11Y_KEY = 'trato-a11y';
const DATA_KEY = 'trato-sd-data';
const USER_KEY = 'trato-sd-user';

const read = (storage, key) => { try { return JSON.parse(storage.getItem(key)); } catch (e) { return null; } };
const write = (storage, key, value) => { try { storage.setItem(key, JSON.stringify(value)); } catch (e) {} };

const a11y = read(localStorage, A11Y_KEY) || {};
const data = read(localStorage, DATA_KEY);
const savedUser = read(localStorage, USER_KEY) || read(sessionStorage, USER_KEY);

let state = {
  user: savedUser && USERS[savedUser.user] ? savedUser : null,
  tickets: data && data.tickets || SEED,
  kb: data && data.kb || KB,
  theme: THEME_META.some(t => t[0] === a11y.theme) ? a11y.theme : 'light',
  scaleIdx: Number.isInteger(a11y.scaleIdx) && SCALES[a11y.scaleIdx] ? a11y.scaleIdx : 1,
  libras: !!a11y.libras,
  toast: null,
  confirm: null
};

const listeners = new Set();
let toastTimer = 0;

export const getState = () => state;

export function setState(patch) {
  const prev = state;
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
  if (prev.tickets !== state.tickets || prev.kb !== state.kb) write(localStorage, DATA_KEY, { tickets: state.tickets, kb: state.kb });
  if (prev.theme !== state.theme || prev.scaleIdx !== state.scaleIdx || prev.libras !== state.libras) {
    write(localStorage, A11Y_KEY, { theme: state.theme, scaleIdx: state.scaleIdx, libras: state.libras });
  }
  listeners.forEach(l => l());
}

export function useStore() {
  const [, tick] = useState(0);
  useEffect(() => { const l = () => tick(n => n + 1); listeners.add(l); return () => listeners.delete(l); }, []);
  return state;
}

// ---------- avisos e confirmação ----------

export function say(msg, opts = {}) {
  clearTimeout(toastTimer);
  setState({ toast: { msg, icon: opts.icon || 'fa-solid fa-circle-check', undo: opts.undo || null } });
  toastTimer = setTimeout(() => setState({ toast: null }), opts.undo ? 7000 : 4000);
}
export const closeToast = () => setState({ toast: null });
export const askConfirm = confirm => setState({ confirm });
export const cancelConfirm = () => setState({ confirm: null });
export function runConfirm() { const c = state.confirm; setState({ confirm: null }); c && c.run(); }

// ---------- sessão ----------

export function signIn(userKey, remember) {
  const user = { ...USERS[userKey], user: userKey };
  write(remember ? localStorage : sessionStorage, USER_KEY, user);
  setState({ user });
}
export function signOut() {
  try { localStorage.removeItem(USER_KEY); sessionStorage.removeItem(USER_KEY); } catch (e) {}
  setState({ user: null });
}

// ---------- chamados ----------

// Aplica `fn` a uma cópia do chamado. Com `toast.undo`, o aviso oferece Desfazer.
function update(id, fn, toast) {
  const prev = state.tickets;
  setState({ tickets: prev.map(t => t.id === id ? fn({ ...t, history: [...t.history] }) : t) });
  if (toast) say(toast.msg, { undo: toast.undo ? prev : null, icon: toast.icon });
}

export function undo() {
  const t = state.toast;
  if (t && t.undo) { setState({ tickets: t.undo, toast: null }); say('Ação desfeita', { icon: 'fa-solid fa-rotate-left' }); }
}

export function createTicket({ subject, desc, files }) {
  const { user, tickets } = state;
  const max = Math.max(...tickets.map(x => +x.id.split('-')[1]));
  const id = '2026-' + String(max + 1).padStart(6, '0');
  const n = nowStr();
  const ticket = { id, subject, desc, client: user.name, type: null, status: 'recebida', prio: 'Média', created: n, updated: n, owner: 'Fila de atendimento', files,
    history: [h(n, 'Sistema', 'Notificação de recebimento enviada · protocolo ' + id), h(n, user.name, 'Solicitação registrada')] };
  setState({ tickets: [ticket, ...tickets] });
  return id;
}

export function classify(id, cls, analysis) {
  const n = nowStr(), info = cls === 'info', who = state.user.name;
  update(id, x => {
    x.type = cls; x.status = info ? 'atendimento' : 'departamento'; x.owner = info ? who : 'Departamento de Atendimento'; x.updated = n; x.analysis = analysis;
    if (!info) x.history.unshift(h(n, 'Sistema', 'Encaminhada ao Departamento de Atendimento'));
    x.history.splice(info ? 0 : 1, 0, h(n, who, 'Classificou como ' + (info ? 'Solicitação de Informação' : 'Reclamação')));
    return x;
  }, { msg: info ? 'Classificada como Informação · status Em atendimento' : 'Reclamação encaminhada ao Departamento', undo: true });
}

export function deliver(id, response, articleTitle) {
  const n = nowStr(), who = state.user.name;
  update(id, x => {
    x.status = 'entregue'; x.response = response; x.article = articleTitle || x.solTitle || null; x.updated = n;
    x.history.unshift(h(n, who, 'Entregou a solução ao cliente'));
    return x;
  }, { msg: 'Solução entregue ao cliente', undo: true });
}

export function closeTicket(id) {
  const n = nowStr(), who = state.user.name;
  update(id, x => {
    x.status = 'encerrada'; x.updated = n;
    x.history.unshift(h(n, 'Sistema', 'Cliente notificado · pesquisa de satisfação enviada'), h(n, who, 'Encerrou a solicitação'));
    return x;
  }, { msg: 'Solicitação encerrada · cliente notificado' });
}

// `known`: usa o artigo `solId` da Base; senão cadastra `newSol` ({ title, body }) na Base.
export function forward(id, diagnosis, known, solId, newSol) {
  const n = nowStr(), who = state.user.name;
  let sol;
  if (known) sol = state.kb.find(a => a.id === solId);
  else { sol = { id: state.kb.length + 1, title: newSol.title, cat: 'Novo', upd: n.slice(0, 5), body: newSol.body }; setState(s => ({ kb: [...s.kb, sol] })); }
  update(id, x => {
    x.status = 'atendimento'; x.fromDept = true; x.diagnosis = diagnosis; x.solTitle = sol.title; x.solBody = sol.body; x.owner = 'Carla Mendes'; x.updated = n;
    x.history.unshift(h(n, who, 'Encaminhou a solução ao atendente'), h(n, who, 'Registrou diagnóstico · ' + (known ? 'problema conhecido' : 'nova solução cadastrada na Base')));
    return x;
  }, { msg: known ? 'Solução encaminhada ao atendente' : 'Solução cadastrada na Base e encaminhada' });
}

export function rate(id, score) {
  const t = state.tickets.find(x => x.id === id);
  if (t && t.rating) { say('A avaliação deste protocolo já foi registrada', { icon: 'fa-solid fa-circle-info' }); return; }
  const n = nowStr(), who = state.user.name;
  update(id, x => { x.rating = score; x.history.unshift(h(n, who, 'Avaliou o atendimento com nota ' + score)); return x; }, { msg: 'Obrigado pela sua avaliação' });
}

export function resetData() {
  setState({ tickets: SEED, kb: KB });
  say('Dados de demonstração restaurados', { icon: 'fa-solid fa-rotate-left' });
}
