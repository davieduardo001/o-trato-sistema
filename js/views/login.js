import { html, useState } from '../../vendor/htm-preact.js';
import { USERS, ROLE } from '../data.js';
import { signIn, say } from '../store.js';
import { Art } from '../components/art.js';
import { Icon, Logo } from '../components/ui.js';

const COPY = {
  cliente: { placeholder: 'voce@email.com', cta: 'Entrar' },
  equipe: { placeholder: 'nome.sobrenome', cta: 'Entrar no painel' }
};

// aceita o usuário (marina) ou o e-mail corporativo completo
const findUser = value => {
  const v = value.trim().toLowerCase();
  return Object.keys(USERS).find(k => k === v || USERS[k].email === v);
};

export function Login() {
  const [profile, setProfile] = useState('cliente');
  const [login, setLogin] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState({ msg: '', field: null });
  const [loading, setLoading] = useState(false);

  const fail = (msg, field) => setError({ msg, field });
  const errLogin = error.field === 'login' || error.field === 'both';
  const errPw = error.field === 'pw' || error.field === 'both';

  const fillDemo = key => {
    setLogin(key); setPw('123456'); setError({ msg: '', field: null });
    setProfile(USERS[key].role === 'cliente' ? 'cliente' : 'equipe');
  };

  const submit = e => {
    e.preventDefault();
    if (loading) return;
    if (!login.trim() || !pw) { fail('Preencha usuário e senha para entrar.', !login.trim() && !pw ? 'both' : !login.trim() ? 'login' : 'pw'); return; }
    setLoading(true); setError({ msg: '', field: null });
    setTimeout(() => {
      const key = findUser(login);
      setLoading(false);
      if (!key) { fail('Usuário ou senha incorretos. Confira e tente de novo.', 'both'); return; }
      const isClient = USERS[key].role === 'cliente';
      if (isClient !== (profile === 'cliente')) { fail(isClient ? 'Esta conta é de cliente. Escolha "Sou cliente" para entrar.' : 'Esta conta é da equipe. Escolha "Sou da equipe" para entrar.', 'login'); return; }
      signIn(key, remember);
    }, 700);
  };

  return html`
    <main id="conteudo" tabindex="-1" class="login">
      <section class="login__art" aria-hidden="true">
        <${Art} />
        <a class="login__logo-light" tabindex="-1"><${Logo} ring="var(--ring)" dot="var(--dot)" /><span>trato</span></a>
        <div class="login__hero">
          <p class="login__eyebrow">Registro · Análise · Solução · Retorno</p>
          <h2>Toda solicitação tem <span>retorno.</span></h2>
        </div>
      </section>

      <section class="login__panel">
        <form class="login__form" onSubmit=${submit} noValidate aria-labelledby="login-title">
          <div class="brand"><${Logo} size=${34} /><span class="brand__name">trato</span><span class="tag">Service Desk</span></div>

          <header class="login__head">
            <h1 id="login-title">Bom te ver de novo.</h1>
            <p>Entre para acompanhar e responder solicitações.</p>
          </header>

          <div class="seg" role="group" aria-label="Tipo de acesso">
            <button type="button" class="seg__btn" aria-pressed=${profile === 'cliente'} onClick=${() => setProfile('cliente')}>Sou cliente</button>
            <button type="button" class="seg__btn" aria-pressed=${profile === 'equipe'} onClick=${() => setProfile('equipe')}>Sou da equipe</button>
          </div>

          <div class="fields">
            <label class="field">
              <span>E-mail ou usuário</span>
              <input name="usuario" autocomplete="username" placeholder=${COPY[profile].placeholder} value=${login} onInput=${e => setLogin(e.target.value)}
                aria-invalid=${errLogin ? 'true' : 'false'} aria-describedby="login-erro" class=${errLogin ? 'is-invalid' : ''} />
            </label>
            <label class="field">
              <span>Senha</span>
              <span class="field__pw">
                <input name="senha" type=${showPw ? 'text' : 'password'} autocomplete="current-password" placeholder="••••••••" value=${pw} onInput=${e => setPw(e.target.value)}
                  aria-invalid=${errPw ? 'true' : 'false'} aria-describedby="login-erro" class=${errPw ? 'is-invalid' : ''} />
                <button type="button" class="pw-toggle" aria-pressed=${showPw} aria-label=${showPw ? 'Ocultar senha' : 'Mostrar senha'} onClick=${() => setShowPw(v => !v)}>
                  <${Icon} name=${showPw ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'} />
                </button>
              </span>
            </label>

            <div id="login-erro" role="alert">
              ${error.msg && html`<div class="alert"><${Icon} name="fa-solid fa-circle-exclamation" /><span>${error.msg}</span></div>`}
            </div>

            <div class="row">
              <label class="check"><input type="checkbox" checked=${remember} onChange=${e => setRemember(e.target.checked)} />Manter conectado</label>
              <a href="#/" onClick=${e => { e.preventDefault(); say('Para redefinir a senha, fale com o Suporte de TI · ramal 4000', { icon: 'fa-solid fa-circle-info' }); }}>Esqueci a senha</a>
            </div>
          </div>

          <button type="submit" class="cta" aria-busy=${loading}>
            <span>${loading ? 'Entrando…' : COPY[profile].cta}</span>
            <span class="cta__arrow" aria-hidden="true"><${Icon} name=${loading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-arrow-right'} /></span>
          </button>

          <div class="demo">
            <span>Protótipo · usuários de teste (qualquer senha)</span>
            <div class="demo__list">
              ${Object.entries(USERS).map(([key, u]) => html`<button type="button" key=${key} onClick=${() => fillDemo(key)}><strong>${key}</strong> · ${ROLE[u.role]}</button>`)}
            </div>
          </div>
        </form>
      </section>
    </main>`;
}
