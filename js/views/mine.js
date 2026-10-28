import { html, useState } from '../../vendor/htm-preact.js';
import { visibleTo, norm, needsRate } from '../data.js';
import { ticketPath } from '../router.js';
import { Icon, StatusBadge } from '../components/ui.js';

export function Mine({ user, state }) {
  const [q, setQ] = useState('');
  const qn = norm(q);
  const rows = visibleTo(user, state.tickets).filter(t => !qn || norm(t.id).includes(qn));

  return html`
    <section class="page-head"><h1>Minhas solicitações</h1><p>Acompanhe pelo protocolo e avalie as encerradas.</p></section>

    <label class="search">
      <span class="search__label">Acompanhar por protocolo</span>
      <span class="search__box"><${Icon} name="fa-solid fa-hashtag" /><input value=${q} onInput=${e => setQ(e.target.value)} inputmode="numeric" placeholder="2026-004812" /></span>
    </label>

    <div class="cards-grid" role="list" aria-live="polite">
      ${rows.map(t => html`
        <div role="listitem" key=${t.id}>
          <a class="ticket-card card" href=${'#' + ticketPath(t.id)}>
            <span class="ticket-card__top"><span class="muted small">#${t.id}</span><${StatusBadge} status=${t.status} /></span>
            <strong>${t.subject}</strong>
            <span class="ticket-card__foot"><span class="muted small">Atualizado ${t.updated}</span>
              ${needsRate(t) && html`<span class="rate-tag"><${Icon} name="fa-solid fa-star" />Avaliar</span>`}</span>
          </a>
        </div>`)}
    </div>
    ${rows.length === 0 && html`<p class="muted"><${Icon} name="fa-solid fa-circle-info" /> Nenhuma solicitação com esse protocolo.</p>`}`;
}
