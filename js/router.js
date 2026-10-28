// Roteador por hash (#/fila?status=recebida). Funciona no GitHub Pages sem configuração.
import { useState, useEffect } from '../vendor/htm-preact.js';

export const ROUTES = { home: '/', queue: '/fila', new: '/nova', mine: '/minhas', kb: '/base', help: '/ajuda' };
export const ticketPath = id => '/chamado/' + id;

function parse() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, qs = ''] = raw.split('?');
  return { path, params: Object.fromEntries(new URLSearchParams(qs)) };
}

export const go = path => { location.hash = '#' + path; };

export function useRoute() {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const onChange = () => setRoute(prev => { const next = parse(); if (prev.path !== next.path) window.scrollTo(0, 0); return next; });
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
