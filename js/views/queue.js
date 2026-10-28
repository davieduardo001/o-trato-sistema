import { html, useState } from '../../vendor/htm-preact.js';
import { ST, visibleTo, norm, typeLabel, needsRate } from '../data.js';
import { ROUTES, ticketPath, go } from '../router.js';
import { Icon, StatusBadge, Prio, Empty } from '../components/ui.js';

const PRIO_RANK = { Alta: 0, 'Média': 1, Baixa: 2 };

export function Queue({ user, state, params }) {
  const [q, setQ] = useState('');
  const dept = user.role === 'departamento';
  const vis = visibleTo(user, state.tickets);
  const filter = ST[params.status] ? params.status : 'todos';
  const statusOrder = dept ? ['departamento', 'atendimento', 'entregue', 'encerrada'] : ['recebida', 'atendimento', 'departamento', 'entregue', 'encerrada'];
  const qn = norm(q);
  const rows = vis
    .filter(t => (filter === 'todos' || t.status === filter) && (!qn || norm(t.id + ' ' + t.subject + ' ' + t.client).includes(qn)))
    .sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status) || PRIO_RANK[a.prio] - PRIO_RANK[b.prio]);
  const pick = id => go(ROUTES.queue + (id === 'todos' ? '' : '?status=' + id));
  const chips = [['todos', 'Todos', vis.length], ...statusOrder.map(s => [s, s === 'departamento' ? 'No Departamento' : ST[s].label, vis.filter(t => t.status === s).length])];

  return html`
    <section class="page-head" aria-labelledby="h-queue">
      <h1 id="h-queue">${dept ? 'Reclamações' : 'Fila de chamados'}</h1>
      <p>${dept ? 'Reclamações encaminhadas pelos atendentes, por prioridade.' : 'Todas as solicitações, das novas às encerradas, por prioridade.'}</p>
    </section>

    <label class="search">
      <span class="search__label">Buscar chamado</span>
      <span class="search__box"><${Icon} name="fa-solid fa-magnifying-glass" /><input type="search" value=${q} onInput=${e => setQ(e.target.value)} placeholder="Protocolo, assunto ou cliente" /></span>
    </label>

    <div class="chips" role="group" aria-label="Filtrar por status">
      ${chips.map(([id, label, n]) => html`
        <button type="button" key=${id} class="chip" aria-pressed=${filter === id} onClick=${() => pick(id)}>
          ${filter === id && html`<${Icon} name="fa-solid fa-check" />`}${label}<span class="chip__n">${n}</span>
        </button>`)}
    </div>

    <div class="card table">
      <div class="table__head" aria-hidden="true"><span>Protocolo</span><span>Assunto · Cliente</span><span>Tipo</span><span>Prioridade</span><span>Status</span><span>Atualizado</span></div>
      <div role="list" aria-label="Chamados" aria-live="polite">
        ${rows.map(t => html`
          <div role="listitem" key=${t.id}>
            <a class="table__row" href=${'#' + ticketPath(t.id)}
              aria-label=${`Abrir chamado ${t.id}: ${t.subject}, ${ST[t.status].label}, prioridade ${t.prio}`}>
              <span class="table__id">${t.status === 'recebida' && html`<span class="new-dot" title="Novo"></span>`}#${t.id}</span>
              <span class="table__subject"><span>${t.subject}</span><span class="muted small">${t.client}</span></span>
              <span class=${'table__type' + (t.type ? '' : ' muted')}>${typeLabel(t)}</span>
              <span><${Prio} prio=${t.prio} /></span>
              <span><${StatusBadge} status=${t.status} /></span>
              <span class="muted small">${t.updated}</span>
            </a>
          </div>`)}
      </div>
      ${rows.length === 0 && html`<${Empty} title="Nenhum chamado encontrado" text="Tente outro termo ou limpe os filtros."
        action=${html`<button type="button" class="btn-ghost" onClick=${() => { setQ(''); pick('todos'); }}>Limpar filtros</button>`} />`}
    </div>`;
}
