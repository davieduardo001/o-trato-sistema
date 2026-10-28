// Cabeçalho, menu lateral, painel de acessibilidade, Libras, avisos e confirmação.
import { html, useEffect, useRef } from '../../vendor/htm-preact.js';
import { MODS, ROLE, THEME_META, SCALES } from '../data.js';
import { ROUTES } from '../router.js';
import { setState, say, closeToast, undo, cancelConfirm, runConfirm } from '../store.js';
import { Icon, Logo } from './ui.js';

// ---------- acessibilidade ----------

export function A11yButton({ open, onToggle, floating }) {
  return html`
    <button type="button" class=${'a11y-btn' + (floating ? ' a11y-btn--floating' : '')} onClick=${onToggle} aria-expanded=${open} aria-controls="painel-a11y" aria-label="Acessibilidade (Alt+3)">
      <span class="a11y-btn__icon" aria-hidden="true"><${Icon} name="fa-solid fa-universal-access" /></span><span class="a11y-btn__label">Acessibilidade</span>
    </button>`;
}

const THEME_ICON = { light: 'fa-solid fa-sun', dark: 'fa-solid fa-moon', hcb: 'fa-solid fa-circle-half-stroke', hcw: 'fa-solid fa-circle-half-stroke' };

export function A11yPanel({ state, onClose, floating }) {
  const ref = useRef(null);
  useEffect(() => { ref.current && ref.current.querySelector('button[role=radio][aria-checked=true]')?.focus(); }, []);
  const { theme, scaleIdx, libras } = state;
  return html`
    <div id="painel-a11y" ref=${ref} class=${'a11y-panel' + (floating ? ' a11y-panel--floating' : '')} role="dialog" aria-labelledby="a11y-t">
      <div class="a11y-panel__head"><strong id="a11y-t">Acessibilidade</strong>
        <button type="button" class="icon-btn" onClick=${onClose} aria-label="Fechar painel de acessibilidade"><${Icon} name="fa-solid fa-xmark" /></button></div>
      <div class="a11y-panel__body">
        <span class="eyebrow" id="a11y-tema">Tema de exibição</span>
        <div role="radiogroup" aria-labelledby="a11y-tema" class="a11y-themes">
          ${THEME_META.map(([id, label]) => html`
            <button type="button" key=${id} role="radio" aria-checked=${theme === id ? 'true' : 'false'} class=${'theme-opt theme-opt--' + id} onClick=${() => setState({ theme: id })}>
              <span class="theme-opt__icon" aria-hidden="true"><${Icon} name=${THEME_ICON[id]} /></span><span>${label}</span>
              ${theme === id && html`<${Icon} name="fa-solid fa-check" />`}
            </button>`)}
        </div>
        <span class="eyebrow" id="a11y-tam">Tamanho do texto</span>
        <div role="group" aria-labelledby="a11y-tam" class="a11y-size">
          <button type="button" disabled=${scaleIdx === 0} aria-label="Diminuir texto" onClick=${() => setState(s => ({ scaleIdx: Math.max(0, s.scaleIdx - 1) }))}>A−</button>
          <span aria-live="polite">${scaleIdx === 1 ? 'Padrão' : Math.round(SCALES[scaleIdx] * 100) + '%'}</span>
          <button type="button" disabled=${scaleIdx === SCALES.length - 1} aria-label="Aumentar texto" onClick=${() => setState(s => ({ scaleIdx: Math.min(SCALES.length - 1, s.scaleIdx + 1) }))}>A+</button>
        </div>
        <span class="eyebrow">Libras</span>
        <button type="button" role="switch" aria-checked=${libras ? 'true' : 'false'} class="switch" onClick=${() => setState(s => ({ libras: !s.libras }))}>
          <span class="switch__icon" aria-hidden="true"><${Icon} name="fa-solid fa-hands-asl-interpreting" /></span><span>Intérprete de Libras</span>
          <span class="switch__track" aria-hidden="true"><span></span></span>
        </button>
        <button type="button" class="btn-ghost" onClick=${() => { setState({ theme: 'light', scaleIdx: 1, libras: false }); say('Preferências restauradas', { icon: 'fa-solid fa-rotate-left' }); }}>
          <${Icon} name="fa-solid fa-rotate-left" /> Restaurar padrão</button>
        <span class="muted small">Atalhos: Alt+1 conteúdo · Alt+2 menu · Alt+3 acessibilidade · Esc fecha</span>
      </div>
    </div>`;
}

export function Libras({ onClose }) {
  return html`
    <aside class="libras" aria-label="Intérprete de Libras">
      <div class="libras__head"><strong><${Icon} name="fa-solid fa-hands-asl-interpreting" /> Libras</strong>
        <button type="button" class="icon-btn" onClick=${onClose} aria-label="Fechar intérprete de Libras"><${Icon} name="fa-solid fa-xmark" /></button></div>
      <div class="libras__stage"><${Icon} name="fa-solid fa-user" /><span>Área do avatar intérprete<br />(integração VLibras · gov.br)</span></div>
      <span class="muted small">Clique em um texto da página para traduzir.</span>
    </aside>`;
}

// ---------- avisos e confirmação ----------

export function ToastHost({ toast }) {
  return html`
    <div class="toast-host" role="status" aria-live="polite">
      ${toast && html`<div class="toast"><${Icon} name=${toast.icon} /><span>${toast.msg}</span>
        ${toast.undo && html`<button type="button" class="toast__undo" onClick=${undo}>Desfazer</button>`}
        <button type="button" class="icon-btn icon-btn--sm" onClick=${closeToast} aria-label="Fechar aviso"><${Icon} name="fa-solid fa-xmark" /></button></div>`}
    </div>`;
}

export function ConfirmDialog({ confirm }) {
  const okRef = useRef(null);
  useEffect(() => { okRef.current && okRef.current.focus(); }, [confirm]);
  if (!confirm) return null;
  return html`
    <div class="modal">
      <div class="modal__box" role="alertdialog" aria-modal="true" aria-labelledby="cf-t" aria-describedby="cf-b">
        <h2 id="cf-t">${confirm.title}</h2>
        <p id="cf-b">${confirm.body}</p>
        <div class="modal__actions">
          <button type="button" class="btn-ghost" onClick=${cancelConfirm}>Cancelar</button>
          <button type="button" class="btn" ref=${okRef} onClick=${runConfirm}>${confirm.ok}</button>
        </div>
      </div>
    </div>`;
}

// ---------- cabeçalho e menu ----------

export function Header({ user, navOpen, onToggleNav, a11yOpen, onToggleA11y, profileOpen, onToggleProfile, onAskLogout, onAskReset }) {
  const initials = user.name.split(' ').map(p => p[0]).slice(0, 2).join('');
  return html`
    <header class="header">
      <button type="button" class="icon-btn" onClick=${onToggleNav} aria-expanded=${navOpen} aria-controls="menu-lateral" aria-label=${navOpen ? 'Recolher menu lateral' : 'Expandir menu lateral'}><${Icon} name="fa-solid fa-bars" /></button>
      <a class="header__brand" href="#/" aria-label="trato, ir para o início"><${Logo} /><span>trato</span></a>
      <span class="tag header__tag">Service Desk</span>
      <div class="header__spacer"></div>
      <${A11yButton} open=${a11yOpen} onToggle=${onToggleA11y} />
      <div class="profile">
        <button type="button" class="profile__btn" onClick=${onToggleProfile} aria-expanded=${profileOpen} aria-haspopup="menu" aria-label=${'Perfil de ' + user.name}>
          <span class="avatar" aria-hidden="true">${initials}</span>
          <span class="profile__who"><span>${user.name}</span><span>${ROLE[user.role]}</span></span>
          <${Icon} name="fa-solid fa-chevron-down" />
        </button>
        ${profileOpen && html`
          <div class="profile__menu" role="menu">
            <div class="profile__info"><strong>${user.name}</strong><span>${user.user} · ${ROLE[user.role]}</span></div>
            <button type="button" role="menuitem" onClick=${onAskReset}><${Icon} name="fa-solid fa-rotate-left" />Restaurar dados de demonstração</button>
            <button type="button" role="menuitem" onClick=${onAskLogout}><${Icon} name="fa-solid fa-arrow-right-from-bracket" />Sair</button>
          </div>`}
      </div>
    </header>`;
}

export function Sidebar({ user, navOpen, activeView, badgeFor, onNavigate }) {
  const items = [...MODS[user.role], ['help', 'fa-solid fa-circle-question', 'Ajuda', '']];
  return html`
    <nav id="menu-lateral" class=${'sidebar ' + (navOpen ? 'sidebar--open' : 'sidebar--closed')} aria-label="Menu principal">
      ${navOpen && html`<span class="sidebar__title">Módulos · ${ROLE[user.role]}</span>`}
      ${items.map(([id, icon, label]) => {
        const badge = badgeFor(id), on = activeView === id;
        return html`
          <a key=${id} href=${'#' + ROUTES[id]} class=${'nav-item' + (on ? ' is-current' : '')} aria-current=${on ? 'page' : 'false'}
            aria-label=${label + (badge ? `, ${badge} pendentes` : '')} title=${label} onClick=${onNavigate}>
            <${Icon} name=${icon} />
            ${navOpen && html`<span>${label}</span>`}
            ${badge > 0 && (navOpen ? html`<span class="nav-item__badge">${badge}</span>` : html`<span class="nav-item__dot" aria-hidden="true"></span>`)}
          </a>`;
      })}
    </nav>`;
}
