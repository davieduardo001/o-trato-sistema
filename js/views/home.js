import { html } from '../../vendor/htm-preact.js';
import { MODS, ST, visibleTo, needsRate, tsOf } from '../data.js';
import { ROUTES, ticketPath } from '../router.js';
import { Icon, StatusBadge } from '../components/ui.js';

export function Home({ user, state }) {
  const { role } = user;
  const vis = visibleTo(user, state.tickets);
  const count = s => vis.filter(t => t.status === s).length;
  const rateable = vis.filter(needsRate).length;
  const first = user.name.split(' ')[0];
  const hr = new Date().getHours();
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  // [rótulo, ícone, valor, dica, rota, filtro de status, status usado para a cor]
  const kpis = {
    cliente: [['Em andamento', 'fa-solid fa-spinner', vis.filter(t => t.status !== 'encerrada').length, 'aguardando retorno', 'mine', null, 'atendimento'], ['Para avaliar', 'fa-solid fa-star', rateable, 'encerradas sem nota', 'mine', null, 'departamento'], ['Encerradas', 'fa-solid fa-circle-check', count('encerrada'), 'no total', 'mine', null, 'encerrada']],
    atendente: [['Novas na fila', 'fa-solid fa-inbox', count('recebida'), 'aguardando classificação', 'queue', 'recebida', 'recebida'], ['Em atendimento', 'fa-solid fa-headset', count('atendimento'), 'com resposta pendente', 'queue', 'atendimento', 'atendimento'], ['No Departamento', 'fa-solid fa-building-user', count('departamento'), 'reclamações em diagnóstico', 'queue', 'departamento', 'departamento'], ['Para encerrar', 'fa-solid fa-paper-plane', count('entregue'), 'solução já entregue', 'queue', 'entregue', 'entregue']],
    departamento: [['Para diagnosticar', 'fa-solid fa-triangle-exclamation', count('departamento'), 'reclamações recebidas', 'queue', 'departamento', 'departamento'], ['Com atendente', 'fa-solid fa-headset', count('atendimento'), 'solução encaminhada', 'queue', 'atendimento', 'atendimento'], ['Encerradas', 'fa-solid fa-circle-check', count('encerrada'), 'reclamações resolvidas', 'queue', 'encerrada', 'encerrada'], ['Soluções na base', 'fa-solid fa-book-open', state.kb.length, 'artigos validados', 'kb', null, null]]
  }[role];

  const cta = role === 'cliente' ? { label: 'Nova solicitação', icon: 'fa-solid fa-plus', to: ROUTES.new }
    : role === 'atendente' ? { label: `Abrir fila · ${count('recebida')} novas`, icon: 'fa-solid fa-arrow-right', to: ROUTES.queue }
    : { label: `Diagnosticar · ${count('departamento')}`, icon: 'fa-solid fa-arrow-right', to: ROUTES.queue };
  const sub = role === 'cliente' ? 'Registre uma solicitação ou acompanhe as que já estão com a gente.'
    : role === 'atendente' ? `Há ${count('recebida')} solicitações novas esperando classificação.`
    : `Há ${count('departamento')} reclamações aguardando diagnóstico.`;
  const recent = vis.slice().sort((a, b) => tsOf(b.updated) - tsOf(a.updated)).slice(0, 5);

  return html`
    <section class="page-head page-head--split" aria-labelledby="h-home">
      <div>
        <span class="muted">${today.charAt(0).toUpperCase() + today.slice(1)}</span>
        <h1 id="h-home">${hr < 12 ? 'Bom dia' : hr < 18 ? 'Boa tarde' : 'Boa noite'}, ${first}.</h1>
        <p>${sub}</p>
      </div>
      <a class="cta cta--inline" href=${'#' + cta.to}>${cta.label}<span class="cta__arrow" aria-hidden="true"><${Icon} name=${cta.icon} /></span></a>
    </section>

    <section class="kpis" aria-label="Resumo">
      ${kpis.map(([label, icon, value, hint, view, filter, tone]) => html`
        <a key=${label} class="kpi card" href=${'#' + ROUTES[view] + (filter ? '?status=' + filter : '')}>
          <span class="kpi__label"><span class=${'kpi__icon' + (tone ? ' st-' + tone : ' kpi__icon--plain')} aria-hidden="true"><${Icon} name=${icon} /></span>${label}</span>
          <span class="kpi__value">${value}</span>
          <span class="muted">${hint}</span>
        </a>`)}
    </section>

    <div class="home-grid">
      <section aria-labelledby="h-mod">
        <h2 id="h-mod">Seus módulos</h2>
        <div class="stack">
          ${MODS[role].filter(m => m[0] !== 'home').map(([id, icon, label, desc]) => html`
            <a key=${id} class="module card" href=${'#' + ROUTES[id]}>
              <span class="module__icon" aria-hidden="true"><${Icon} name=${icon} /></span>
              <span class="module__text"><strong>${label}</strong><span>${desc}</span></span>
              <${Icon} name="fa-solid fa-arrow-right" />
            </a>`)}
        </div>
      </section>
      <section aria-labelledby="h-rec">
        <h2 id="h-rec">${role === 'cliente' ? 'Suas solicitações recentes' : 'Atividade recente'}</h2>
        <div class="card list" role="list">
          ${recent.map(t => html`
            <div role="listitem" key=${t.id}>
              <a class="list__item" href=${'#' + ticketPath(t.id)}>
                <span class="list__main"><span>${t.subject}</span><span class="muted small">#${t.id} · ${t.client} · ${t.updated}</span></span>
                <${StatusBadge} status=${t.status} />
              </a>
            </div>`)}
          ${recent.length === 0 && html`<p class="muted pad">Nada por aqui ainda.</p>`}
        </div>
      </section>
    </div>`;
}
