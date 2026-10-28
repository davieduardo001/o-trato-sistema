// Base de Conhecimento e Ajuda.
import { html, useState } from '../../vendor/htm-preact.js';
import { ST, kbSearch } from '../data.js';
import { Icon, StatusBadge } from '../components/ui.js';

export function KnowledgeBase({ state }) {
  const [q, setQ] = useState('');
  const list = kbSearch(state.kb, q);
  return html`
    <section class="page-head"><h1>Base de Conhecimento</h1><p>Soluções validadas para responder com rapidez e precisão.</p></section>
    <label class="search">
      <span class="search__label">Pesquisar artigos</span>
      <span class="search__box"><${Icon} name="fa-solid fa-magnifying-glass" /><input type="search" value=${q} onInput=${e => setQ(e.target.value)} placeholder="Ex.: estorno, acesso" /></span>
    </label>
    <span class="muted" aria-live="polite">${list.length} artigo(s)</span>
    <div class="stack stack--tight">
      ${list.map(a => html`
        <details class="card article" key=${a.id}>
          <summary><span class="article__title"><strong>${a.title}</strong><span class="muted small">${a.cat} · atualizado ${a.upd}</span></span><${Icon} name="fa-solid fa-chevron-down" /></summary>
          <p>${a.body}</p>
        </details>`)}
    </div>
    ${list.length === 0 && html`<p class="muted"><${Icon} name="fa-solid fa-circle-info" /> Nenhum resultado encontrado.</p>`}`;
}

const GLOSSARY = {
  recebida: 'Registrada pelo cliente; aguarda a análise do atendente.',
  atendimento: 'Com o atendente, que prepara a resposta ou entrega a solução do Departamento.',
  departamento: 'Reclamação em diagnóstico pelo Departamento de Atendimento.',
  entregue: 'A resposta foi enviada ao cliente; falta encerrar.',
  encerrada: 'Concluída. O cliente foi notificado e recebeu a pesquisa de satisfação.'
};

export function Help() {
  return html`
    <section class="page-head"><h1>Ajuda</h1><p>O que significa cada status e como a solicitação anda.</p></section>
    <div class="help-grid">
      <section class="card pad-card">
        <h2>Status</h2>
        ${Object.keys(ST).map(s => html`<div class="glossary" key=${s}><${StatusBadge} status=${s} /><span>${GLOSSARY[s]}</span></div>`)}
      </section>
      <section class="card pad-card">
        <h2>Acessibilidade</h2>
        <ul>
          <li>Quatro modos de contraste: claro, escuro, alto contraste preto e alto contraste branco.</li>
          <li>Texto de 87% a 150% com A− / A+.</li>
          <li>Intérprete de Libras pelo botão de mãos no painel de acessibilidade.</li>
          <li>Alt+1 conteúdo · Alt+2 menu · Alt+3 acessibilidade · Esc fecha.</li>
          <li>Tudo em Acessibilidade, no topo da tela.</li>
        </ul>
        <h2>Precisa de mais ajuda?</h2>
        <p>Suporte de TI · ramal 4000 · suporte@empresa.com.br</p>
      </section>
    </div>`;
}
