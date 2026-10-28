import { html, useState } from '../../vendor/htm-preact.js';
import { ST, MODS, visibleTo, typeLabel, needsRate, norm, kbSearch, snip } from '../data.js';
import { ROUTES, go } from '../router.js';
import { say, askConfirm, classify, deliver, closeTicket, forward, rate } from '../store.js';
import { Icon, StatusBadge, Prio, RadioCard, Action, Empty } from '../components/ui.js';

const STEPS = {
  recl: [['recebida', 'Recebida'], ['departamento', 'No Departamento'], ['atendimento', 'Em atendimento'], ['entregue', 'Solução entregue'], ['encerrada', 'Encerrada']],
  info: [['recebida', 'Recebida'], ['atendimento', 'Em atendimento'], ['entregue', 'Solução entregue'], ['encerrada', 'Encerrada']]
};

function Stepper({ t }) {
  const steps = STEPS[t.type === 'recl' ? 'recl' : 'info'];
  const cur = steps.findIndex(s => s[0] === t.status);
  return html`
    <ol class="stepper card" aria-label="Andamento da solicitação">
      ${steps.map(([, label], i) => {
        const done = i < cur || (t.status === 'encerrada' && i === cur), now = i === cur && !done;
        return html`
          <li key=${label} aria-current=${now ? 'step' : 'false'} class=${done ? 'is-done' : now ? 'is-now' : ''}>
            <span class="stepper__track"><span class="stepper__dot" aria-hidden="true"><${Icon} name=${done ? 'fa-solid fa-check' : now ? 'fa-solid fa-circle' : 'fa-regular fa-circle'} /></span><span class="stepper__line"></span></span>
            <span class="stepper__text"><strong>${label}</strong><span class="muted small">${done ? 'Concluída' : now ? 'Etapa atual' : 'Pendente'}</span></span>
          </li>`;
      })}
    </ol>`;
}

// ---------- painéis de ação ----------

function Classify({ t }) {
  const [analysis, setAnalysis] = useState('');
  const [cls, setCls] = useState(null);
  const options = [['info', 'Solicitação de Informação', 'Fica com você. Responda usando a Base de Conhecimento.'], ['recl', 'Reclamação', 'Vai para o Departamento de Atendimento diagnosticar.']];
  return html`
    <section class="card action-card" aria-labelledby="h-cls">
      <div><h2 id="h-cls">Analisar e classificar</h2><p>Registre o que você entendeu e escolha o fluxo. Reclamações seguem automaticamente para o Departamento.</p></div>
      <label class="field"><span>Dados da análise <span class="muted">(opcional)</span></span>
        <textarea rows="3" value=${analysis} onInput=${e => setAnalysis(e.target.value)}></textarea></label>
      <div class="radios radios--2" role="radiogroup" aria-label="Classificação">
        ${options.map(([id, label, desc]) => html`<${RadioCard} key=${id} checked=${cls === id} onPick=${() => setCls(id)}><strong>${label}</strong><span>${desc}</span><//>`)}
      </div>
      <${Action} disabled=${!cls} hint="Escolha um tipo para continuar." onClick=${() => classify(t.id, cls, analysis)}>Confirmar classificação<//>
    </section>`;
}

function Respond({ t, kb }) {
  const [resp, setResp] = useState(t.fromDept ? t.solBody : '');
  const [kbQ, setKbQ] = useState('');
  const [attached, setAttached] = useState(null);
  const hits = kbSearch(kb, kbQ).slice(0, kbQ ? 6 : 3);
  const attach = a => { const on = attached === a.id; setAttached(on ? null : a.id); if (!on && !resp) setResp(a.body); };
  const empty = !resp.trim();
  return html`
    <section class="card action-card" aria-labelledby="h-resp">
      <div><h2 id="h-resp">Responder ao cliente</h2>
        <p>${t.fromDept ? 'O Departamento já encaminhou a solução. Revise o texto e entregue ao cliente.' : 'Pesquise na Base de Conhecimento, anexe um artigo se ajudar e escreva a resposta.'}</p></div>
      ${t.fromDept && html`<div class="callout"><${Icon} name="fa-solid fa-building-user" /><span><strong>Solução do Departamento: ${t.solTitle}</strong><span>Diagnóstico: ${t.diagnosis}</span></span></div>`}
      ${!t.fromDept && html`
        <div class="kb-box">
          <label class="search"><span class="search__label">Consultar Base de Conhecimento</span>
            <span class="search__box"><${Icon} name="fa-solid fa-magnifying-glass" /><input type="search" value=${kbQ} onInput=${e => setKbQ(e.target.value)} placeholder="Ex.: reembolso, endereço" /></span></label>
          <div aria-live="polite" class="stack stack--tight">
            ${hits.map(a => html`
              <div class="kb-hit" key=${a.id}>
                <span class="kb-hit__text"><strong>${a.title}</strong><span class="muted small">${a.cat} · ${snip(a)}</span></span>
                <button type="button" class=${'btn-chip' + (attached === a.id ? ' is-on' : '')} aria-pressed=${attached === a.id} onClick=${() => attach(a)}>${attached === a.id ? 'Anexado' : 'Anexar'}</button>
              </div>`)}
            ${hits.length === 0 && html`<span class="muted"><${Icon} name="fa-solid fa-circle-info" /> Nenhum resultado encontrado. Redija a resposta manualmente abaixo.</span>`}
          </div>
        </div>`}
      <label class="field"><span>Resposta ao cliente *</span>
        <textarea rows="5" value=${resp} onInput=${e => setResp(e.target.value)} aria-required="true"></textarea></label>
      <div class="actions">
        <button type="button" class="btn" disabled=${empty}
          onClick=${() => deliver(t.id, resp.trim(), (kb.find(a => a.id === attached) || {}).title)}>Entregar solução</button>
        <button type="button" class="btn-ghost" onClick=${() => say('Relatório do atendimento #' + t.id + ' gerado', { icon: 'fa-solid fa-file-lines' })}><${Icon} name="fa-solid fa-file-lines" /> Gerar relatório</button>
        ${empty && html`<span class="hint"><${Icon} name="fa-solid fa-circle-info" /> Escreva a resposta para entregar.</span>`}
      </div>
    </section>`;
}

function Close({ t }) {
  const ask = () => askConfirm({ title: 'Encerrar a solicitação #' + t.id + '?', body: 'O cliente será notificado do encerramento e receberá a pesquisa de satisfação. Essa ação não pode ser desfeita.', ok: 'Encerrar', run: () => closeTicket(t.id) });
  return html`
    <section class="card action-card" aria-labelledby="h-close">
      <div><h2 id="h-close">Encerrar solicitação</h2><p>A solução foi entregue. Ao encerrar, o cliente é notificado e recebe a pesquisa de satisfação.</p></div>
      <div class="actions"><button type="button" class="btn" onClick=${ask}>Encerrar solicitação</button></div>
    </section>`;
}

function Diagnose({ t, kb }) {
  const [diag, setDiag] = useState('');
  const [known, setKnown] = useState(null);
  const [pick, setPick] = useState(null);
  const [newT, setNewT] = useState('');
  const [newB, setNewB] = useState('');
  // sugestões: artigos da Base que compartilham palavras com o chamado
  const words = norm(t.subject + ' ' + t.desc).split(/\W+/).filter(w => w.length > 4);
  const sugg = kb.map(a => ({ a, s: words.filter(w => norm(a.title + ' ' + a.body).includes(w)).length })).sort((x, y) => y.s - x.s).slice(0, 3).map(x => x.a);
  const disabled = !diag.trim() || known === null || (known === true && !pick) || (known === false && (!newT.trim() || !newB.trim()));
  const hint = !diag.trim() ? 'Registre o diagnóstico.' : known === null ? 'Indique se o problema é conhecido.' : known ? 'Escolha uma solução sugerida.' : 'Preencha título e passos da nova solução.';
  return html`
    <section class="card action-card" aria-labelledby="h-diag">
      <div><h2 id="h-diag">Diagnosticar reclamação</h2><p>Registre o diagnóstico e diga se o problema já é conhecido. A solução segue para o atendente entregar.</p></div>
      <label class="field"><span>Diagnóstico *</span><textarea rows="3" value=${diag} onInput=${e => setDiag(e.target.value)} aria-required="true"></textarea></label>
      <div class="field" role="radiogroup" aria-label="O problema é conhecido?">
        <span>O problema é conhecido? *</span>
        <div class="radios radios--row">
          ${[[true, 'Sim, é conhecido'], [false, 'Não, é novo']].map(([val, label]) => html`
            <${RadioCard} key=${label} small checked=${known === val} onPick=${() => { setKnown(val); setPick(null); }}>${label}<//>`)}
        </div>
      </div>
      ${known === true && html`
        <div class="field" role="radiogroup" aria-label="Soluções sugeridas">
          <span>Soluções sugeridas da Base de Conhecimento *</span>
          <div class="radios">
            ${sugg.map(a => html`<${RadioCard} key=${a.id} checked=${pick === a.id} onPick=${() => setPick(a.id)}><strong>${a.title}</strong><span>${a.cat} · ${snip(a)}</span><//>`)}
          </div>
        </div>`}
      ${known === false && html`
        <div class="kb-box">
          <strong>Nova solução · será adicionada à Base de Conhecimento</strong>
          <label class="field"><span>Título *</span><input value=${newT} onInput=${e => setNewT(e.target.value)} aria-required="true" /></label>
          <label class="field"><span>Passos da solução *</span><textarea rows="3" value=${newB} onInput=${e => setNewB(e.target.value)} aria-required="true"></textarea></label>
        </div>`}
      <${Action} disabled=${disabled} hint=${hint} onClick=${() => forward(t.id, diag.trim(), known, pick, { title: newT.trim(), body: newB.trim() })}>
        ${known === false ? 'Cadastrar e encaminhar' : 'Encaminhar ao atendente'}<//>
    </section>`;
}

function Rate({ t }) {
  const [score, setScore] = useState(0);
  return html`
    <section class="card action-card" aria-labelledby="h-rate">
      <div><h2 id="h-rate">Como foi seu atendimento?</h2><p>De 1 (ruim) a 5 (excelente). Leva 30 segundos.</p></div>
      <div class="rating" role="radiogroup" aria-label="Nota de 1 a 5">
        ${[1, 2, 3, 4, 5].map(n => html`<button type="button" key=${n} role="radio" aria-checked=${score === n ? 'true' : 'false'} aria-label=${`Nota ${n} de 5`} class="rating__opt" onClick=${() => setScore(n)}>${n}</button>`)}
      </div>
      <div class="rating__legend muted small"><span>Ruim</span><span>Excelente</span></div>
      <${Action} disabled=${!score} hint="Escolha uma nota." onClick=${() => rate(t.id, score)}>Enviar avaliação<//>
    </section>`;
}

const Note = ({ icon, title, text, status }) => html`
  <section class="card note" role=${status ? 'status' : undefined}><${Icon} name=${icon} /><span><strong>${title}</strong><span>${text}</span></span></section>`;

function Actions({ t, user, kb }) {
  const { role } = user;
  const key = t.id + t.status;
  if (role === 'atendente' && t.status === 'recebida') return html`<${Classify} key=${key} t=${t} />`;
  if (role === 'atendente' && t.status === 'atendimento') return html`<${Respond} key=${key} t=${t} kb=${kb} />`;
  if (role === 'atendente' && t.status === 'entregue') return html`<${Close} key=${key} t=${t} />`;
  if (role === 'departamento' && t.status === 'departamento') return html`<${Diagnose} key=${key} t=${t} kb=${kb} />`;
  if (role === 'cliente' && needsRate(t)) return html`<${Rate} key=${key} t=${t} />`;
  if (role === 'cliente' && t.rating) return html`<${Note} status icon="fa-solid fa-circle-check" title=${`Avaliação já registrada: ${t.rating} de 5`} text="Obrigado pela sua avaliação. Ela ajuda a melhorar nosso atendimento." />`;
  const text = role === 'cliente'
    ? (t.status === 'encerrada' ? 'Solicitação encerrada.' : `Sua solicitação está em "${ST[t.status].label}". Avisamos você por e-mail a cada mudança.`)
    : `Esta etapa está com: ${t.owner}.`;
  return html`<${Note} icon="fa-solid fa-hourglass-half" title="Nenhuma ação sua agora" text=${text} />`;
}

// ---------- tela ----------

export function Ticket({ id, user, state }) {
  const t = visibleTo(user, state.tickets).find(x => x.id === id);
  if (!t) {
    return html`<${Empty} icon="fa-solid fa-circle-question" title="Chamado não encontrado" text="O protocolo não existe ou você não tem acesso a ele."
      action=${html`<button type="button" class="btn-ghost" onClick=${() => go(ROUTES.home)}>Ir para o início</button>`} />`;
  }
  const backView = user.role === 'cliente' ? 'mine' : 'queue';
  const backLabel = MODS[user.role].find(m => m[0] === backView)[2];
  return html`
    <div class="ticket-head">
      <div>
        <div class="ticket-head__meta">
          <span class="muted">Protocolo #${t.id}</span><${StatusBadge} status=${t.status} />
          <span class="type-chip">${typeLabel(t)}</span><${Prio} prio=${t.prio} label="Prioridade" />
        </div>
        <h1>${t.subject}</h1>
      </div>
      <a class="btn-ghost" href=${'#' + ROUTES[backView]}><${Icon} name="fa-solid fa-arrow-left" />Voltar para ${backLabel.toLowerCase()}</a>
    </div>

    <${Stepper} t=${t} />

    <div class="ticket-grid">
      <div class="stack">
        <section class="card pad-card" aria-labelledby="h-desc">
          <h2 id="h-desc">Descrição do cliente</h2>
          <p>${t.desc}</p>
          ${t.files.length > 0 && html`<div class="files">${t.files.map(f => html`<span class="file" key=${f}><${Icon} name="fa-solid fa-paperclip" />${f}</span>`)}</div>`}
          ${t.response && html`<div class="callout callout--soft"><strong>Resposta entregue</strong><p>${t.response}</p>
            ${t.article && html`<span class="muted small"><${Icon} name="fa-solid fa-book-open" /> Artigo: ${t.article}</span>`}</div>`}
        </section>
        <${Actions} t=${t} user=${user} kb=${state.kb} />
      </div>
      <aside class="stack">
        <section class="card pad-card" aria-labelledby="h-det">
          <h2 id="h-det">Detalhes</h2>
          <dl class="details"><dt>Cliente</dt><dd>${t.client}</dd><dt>Aberto em</dt><dd>${t.created}</dd><dt>Responsável</dt><dd>${t.owner}</dd><dt>Tipo</dt><dd>${typeLabel(t)}</dd></dl>
        </section>
        <section class="card pad-card" aria-labelledby="h-hist">
          <h2 id="h-hist">Histórico</h2>
          <ol class="timeline">
            ${t.history.map((x, i) => html`
              <li key=${i}><span class=${'timeline__dot' + (i === 0 ? ' is-first' : '')} aria-hidden="true"></span>
                <span><span>${x.what}</span><span class="muted small">${x.when} · ${x.who}</span></span></li>`)}
          </ol>
        </section>
      </aside>
    </div>`;
}
