import { html, render, useState, useEffect } from '../vendor/htm-preact.js';
import { MODS, SCALES, visibleTo, needsRate } from './data.js';
import { ROUTES, useRoute, go } from './router.js';
import { useStore, setState, signOut, askConfirm, resetData } from './store.js';
import { A11yButton, A11yPanel, Libras, ToastHost, ConfirmDialog, Header, Sidebar } from './components/shell.js';
import { Login } from './views/login.js';
import { Home } from './views/home.js';
import { Queue } from './views/queue.js';
import { Mine } from './views/mine.js';
import { NewTicket } from './views/new.js';
import { Ticket } from './views/ticket.js';
import { KnowledgeBase, Help } from './views/pages.js';

const MOBILE_MAX = 900;
const ALLOWED = { cliente: ['home', 'new', 'mine', 'help', 'ticket'], atendente: ['home', 'queue', 'kb', 'help', 'ticket'], departamento: ['home', 'queue', 'kb', 'help', 'ticket'] };

function viewOf(path) {
  const ticket = /^\/chamado\/(.+)$/.exec(path);
  if (ticket) return { view: 'ticket', id: decodeURIComponent(ticket[1]) };
  return { view: Object.keys(ROUTES).find(v => ROUTES[v] === path) || null };
}

const focusMain = () => { const m = document.getElementById('conteudo'); m && m.focus(); };

function App() {
  const state = useStore();
  const route = useRoute();
  const [navOpen, setNavOpen] = useState(() => window.innerWidth > MOBILE_MAX);
  const [a11yOpen, setA11yOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, theme, scaleIdx } = state;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.fontSize = (14 * SCALES[scaleIdx]) + 'px';
  }, [theme, scaleIdx]);

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') { setA11yOpen(false); setProfileOpen(false); if (window.innerWidth <= MOBILE_MAX) setNavOpen(false); }
      if (e.altKey && e.key === '1') { e.preventDefault(); focusMain(); }
      if (e.altKey && e.key === '2') { e.preventDefault(); const l = document.querySelector('#menu-lateral a'); l && l.focus(); }
      if (e.altKey && e.key === '3') { e.preventDefault(); setA11yOpen(true); }
    };
    const onPointer = e => { if (!e.target.closest('.profile, .a11y-panel, .a11y-btn')) { setProfileOpen(false); setA11yOpen(false); } };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onPointer); };
  }, []);

  // ao navegar: fecha popovers e, no mobile, o menu
  useEffect(() => {
    setProfileOpen(false); setA11yOpen(false);
    if (window.innerWidth <= MOBILE_MAX) setNavOpen(false);
  }, [route.path]);

  const { view, id } = viewOf(route.path);
  const allowed = !user || (view && ALLOWED[user.role].includes(view));
  useEffect(() => { if (user && !allowed) go(ROUTES.home); }, [user, allowed]);

  const toggleA11y = () => { setA11yOpen(o => !o); setProfileOpen(false); };
  const common = html`
    ${a11yOpen && html`<${A11yPanel} state=${state} onClose=${() => setA11yOpen(false)} floating=${!user} />`}
    ${state.libras && html`<${Libras} onClose=${() => setState({ libras: false })} />`}
    <${ToastHost} toast=${state.toast} />
    <${ConfirmDialog} confirm=${state.confirm} />`;

  if (!user) {
    return html`
      <${A11yButton} open=${a11yOpen} onToggle=${toggleA11y} floating />
      <${Login} />
      ${common}`;
  }

  const vis = visibleTo(user, state.tickets);
  const count = s => vis.filter(t => t.status === s).length;
  const badgeFor = vid => vid === 'queue' ? (user.role === 'atendente' ? count('recebida') + count('atendimento') + count('entregue') : count('departamento')) : vid === 'mine' ? vis.filter(needsRate).length : 0;
  const labelOf = vid => (MODS[user.role].find(m => m[0] === vid) || [0, 0, 'Ajuda'])[2];
  const parent = user.role === 'cliente' ? 'mine' : 'queue';
  const crumbs = [{ label: 'Início', to: ROUTES.home }];
  if (view === 'ticket') crumbs.push({ label: labelOf(parent), to: ROUTES[parent] }, { label: '#' + id });
  else if (view && view !== 'home') crumbs.push({ label: labelOf(view) });

  const page = !allowed ? null
    : view === 'home' ? html`<${Home} user=${user} state=${state} />`
    : view === 'queue' ? html`<${Queue} user=${user} state=${state} params=${route.params} />`
    : view === 'mine' ? html`<${Mine} user=${user} state=${state} />`
    : view === 'new' ? html`<${NewTicket} user=${user} />`
    : view === 'ticket' ? html`<${Ticket} id=${id} user=${user} state=${state} />`
    : view === 'kb' ? html`<${KnowledgeBase} state=${state} />`
    : html`<${Help} />`;

  const askLogout = () => {
    setProfileOpen(false);
    askConfirm({ title: 'Sair do sistema?', body: 'Você precisará entrar com usuário e senha novamente.', ok: 'Sair', run: () => { signOut(); go(ROUTES.home); } });
  };
  const askReset = () => {
    setProfileOpen(false);
    askConfirm({ title: 'Restaurar dados de demonstração?', body: 'Chamados e artigos voltam ao estado inicial. O que foi criado neste navegador será apagado.', ok: 'Restaurar', run: resetData });
  };

  return html`
    <div class=${'app' + (navOpen ? ' app--nav-open' : '')}>
      <a class="skip" href="#conteudo" onClick=${e => { e.preventDefault(); focusMain(); }}>Pular para o conteúdo (Alt+1)</a>
      <${Header} user=${user} navOpen=${navOpen} onToggleNav=${() => setNavOpen(o => !o)} a11yOpen=${a11yOpen} onToggleA11y=${toggleA11y}
        profileOpen=${profileOpen} onToggleProfile=${() => { setProfileOpen(o => !o); setA11yOpen(false); }} onAskLogout=${askLogout} onAskReset=${askReset} />
      <${Sidebar} user=${user} navOpen=${navOpen} activeView=${view === 'ticket' ? parent : view} badgeFor=${badgeFor} onNavigate=${() => {}} />
      <div class="scrim" onClick=${() => setNavOpen(false)}></div>
      <main id="conteudo" class="main" tabindex="-1">
        <nav class="crumbs" aria-label="Você está em">
          ${crumbs.map((c, i) => i < crumbs.length - 1
            ? html`<span key=${i}><a href=${'#' + c.to}>${c.label}</a><span aria-hidden="true"> / </span></span>`
            : html`<span key=${i} aria-current="page">${c.label}</span>`)}
        </nav>
        ${page}
      </main>
    </div>
    ${common}`;
}

document.documentElement.lang = 'pt-BR';
render(html`<${App} />`, document.getElementById('root'));
