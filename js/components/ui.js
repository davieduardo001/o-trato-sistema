// Peças reutilizáveis de interface.
import { html } from '../../vendor/htm-preact.js';
import { ST } from '../data.js';

export const Icon = ({ name }) => html`<i class=${name} aria-hidden="true"></i>`;

export const StatusBadge = ({ status }) => html`<span class=${'badge st-' + status}><${Icon} name=${ST[status].icon} />${ST[status].label}</span>`;

export const PrioMeta = prio => prio === 'Alta' ? ['fa-solid fa-arrow-up', 'var(--danger)'] : prio === 'Média' ? ['fa-solid fa-minus', 'var(--tx)'] : ['fa-solid fa-arrow-down', 'var(--tx2)'];

export const Prio = ({ prio, label }) => {
  const [icon, color] = PrioMeta(prio);
  return html`<span class="prio" style=${{ color }}><${Icon} name=${icon} />${label ? label + ' ' : ''}${prio}</span>`;
};

// Opção de rádio em cartão (role="radio" dentro de um radiogroup).
export const RadioCard = ({ checked, onPick, small, children }) => html`
  <button type="button" role="radio" aria-checked=${checked ? 'true' : 'false'} class=${'radio' + (small ? ' radio--sm' : '')} onClick=${onPick}>
    <span class="radio__dot" aria-hidden="true"><span></span></span>
    <span class="radio__body">${children}</span>
  </button>`;

// Botão de ação principal. Desabilitado mostra a dica ao lado.
export const Action = ({ disabled, hint, onClick, type = 'button', children }) => html`
  <div class="actions">
    <button type=${type} class="btn" disabled=${disabled} onClick=${onClick}>${children}</button>
    ${disabled && hint && html`<span class="hint"><${Icon} name="fa-solid fa-circle-info" /> ${hint}</span>`}
  </div>`;

export const Empty = ({ icon = 'fa-solid fa-inbox', title, text, action }) => html`
  <div class="empty">
    <${Icon} name=${icon} /><strong>${title}</strong>${text && html`<span>${text}</span>`}${action}
  </div>`;

export const Logo = ({ size = 26, ring = 'var(--logoRing)', dot = 'var(--logoDot)' }) => html`
  <svg width=${size} height=${size} viewBox="0 0 40 40" aria-hidden="true"><path d="M32.22 15.55A13 13 0 1 1 22.26 7.2" fill="none" style=${{ stroke: ring }} stroke-width="6" stroke-linecap="round" /><circle cx="29.2" cy="9.2" r="3.6" style=${{ fill: dot }} /></svg>`;
