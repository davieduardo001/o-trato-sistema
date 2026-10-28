import { html, useState } from '../../vendor/htm-preact.js';
import { createTicket } from '../store.js';
import { go, ticketPath, ROUTES } from '../router.js';
import { Icon } from '../components/ui.js';

export function NewTicket({ user }) {
  const [subject, setSubject] = useState('');
  const [desc, setDesc] = useState('');
  const [files, setFiles] = useState([]);
  const [tried, setTried] = useState(false);
  const [doneId, setDoneId] = useState(null);

  const errSubject = tried && !subject.trim(), errDesc = tried && !desc.trim();

  const submit = e => {
    e.preventDefault();
    if (!subject.trim() || !desc.trim()) { setTried(true); return; }
    setDoneId(createTicket({ subject: subject.trim(), desc: desc.trim(), files }));
    setSubject(''); setDesc(''); setFiles([]); setTried(false);
  };

  if (doneId) {
    return html`
      <section class="done card" role="status" aria-labelledby="h-done">
        <span class="done__tag"><${Icon} name="fa-solid fa-circle-check" />Solicitação registrada · status Recebida</span>
        <h1 id="h-done">Recebemos sua solicitação.</h1>
        <div class="protocol"><span class="muted small">Número de protocolo</span><strong>${doneId}</strong></div>
        <p>Enviamos a confirmação para ${user.email}. Use o protocolo para acompanhar o andamento.</p>
        <div class="actions">
          <button type="button" class="btn" onClick=${() => go(ticketPath(doneId))}>Acompanhar solicitação</button>
          <button type="button" class="btn-ghost" onClick=${() => setDoneId(null)}>Registrar outra</button>
        </div>
      </section>`;
  }

  return html`
    <form class="card form-card" onSubmit=${submit} noValidate aria-labelledby="h-new">
      <div class="page-head page-head--flush"><h1 id="h-new">Nova solicitação</h1><p>Conte o que aconteceu. Você recebe um número de protocolo para acompanhar.</p></div>

      <div role="alert">${(errSubject || errDesc) && html`<div class="alert"><${Icon} name="fa-solid fa-circle-exclamation" />Preencha os campos obrigatórios</div>`}</div>

      <label class="field">
        <span>Assunto *</span>
        <input value=${subject} onInput=${e => setSubject(e.target.value)} placeholder="Resumo em uma frase" aria-required="true" aria-invalid=${errSubject ? 'true' : 'false'}
          aria-describedby="err-assunto" class=${errSubject ? 'is-invalid' : ''} />
        ${errSubject && html`<span class="field__err" id="err-assunto"><${Icon} name="fa-solid fa-circle-exclamation" />Informe o assunto.</span>`}
      </label>

      <label class="field">
        <span>Descrição *</span>
        <textarea rows="6" value=${desc} onInput=${e => setDesc(e.target.value)} placeholder="O que aconteceu, quando e o que você esperava" aria-required="true"
          aria-invalid=${errDesc ? 'true' : 'false'} aria-describedby="err-desc" class=${errDesc ? 'is-invalid' : ''}></textarea>
        ${errDesc && html`<span class="field__err" id="err-desc"><${Icon} name="fa-solid fa-circle-exclamation" />Descreva o que aconteceu.</span>`}
      </label>

      <div class="field">
        <span>Anexos <span class="muted">(opcional)</span></span>
        <label class="file-btn"><${Icon} name="fa-solid fa-paperclip" />Escolher arquivos
          <input type="file" multiple onChange=${e => { const names = [...e.target.files].map(f => f.name); setFiles(prev => [...prev, ...names]); e.target.value = ''; }} /></label>
        <div class="files">
          ${files.map((name, i) => html`<span class="file" key=${name + i}>${name}
            <button type="button" class="icon-btn icon-btn--sm" aria-label=${'Remover ' + name} onClick=${() => setFiles(prev => prev.filter((_, j) => j !== i))}><${Icon} name="fa-solid fa-xmark" /></button></span>`)}
        </div>
      </div>

      <p class="lgpd"><${Icon} name="fa-solid fa-shield-halved" /> Seus dados são tratados conforme a LGPD (Lei nº 13.709/2018) e usados apenas para este atendimento.</p>

      <div class="actions">
        <button type="submit" class="btn">Enviar solicitação</button>
        <button type="button" class="btn-ghost" onClick=${() => go(ROUTES.home)}>Cancelar</button>
      </div>
    </form>`;
}
