// Dados de exemplo e metadados do Service Desk (portados do protótipo).

export const ST = {
  recebida: { label: 'Recebida', icon: 'fa-solid fa-inbox' },
  atendimento: { label: 'Em atendimento', icon: 'fa-solid fa-headset' },
  departamento: { label: 'Em análise pelo Departamento', icon: 'fa-solid fa-building-user' },
  entregue: { label: 'Solução entregue', icon: 'fa-solid fa-paper-plane' },
  encerrada: { label: 'Encerrada', icon: 'fa-solid fa-circle-check' }
};

export const USERS = {
  marina: { name: 'Marina Costa', role: 'cliente', email: 'marina.costa@empresa.com.br' },
  carla: { name: 'Carla Mendes', role: 'atendente', email: 'carla.mendes@empresa.com.br' },
  rafael: { name: 'Rafael Souza', role: 'departamento', email: 'rafael.souza@empresa.com.br' }
};

export const ROLE = { cliente: 'Cliente', atendente: 'Atendente', departamento: 'Depto. de Atendimento' };

// [id da rota, ícone, rótulo, descrição do cartão]
export const MODS = {
  cliente: [
    ['home', 'fa-solid fa-house', 'Início', ''],
    ['new', 'fa-solid fa-plus', 'Nova solicitação', 'Registre um pedido de informação ou uma reclamação'],
    ['mine', 'fa-solid fa-list-check', 'Minhas solicitações', 'Acompanhe pelo protocolo e avalie o atendimento']
  ],
  atendente: [
    ['home', 'fa-solid fa-house', 'Início', ''],
    ['queue', 'fa-solid fa-inbox', 'Fila de chamados', 'Analise, classifique e responda solicitações'],
    ['kb', 'fa-solid fa-book-open', 'Base de Conhecimento', 'Artigos e soluções validadas']
  ],
  departamento: [
    ['home', 'fa-solid fa-house', 'Início', ''],
    ['queue', 'fa-solid fa-triangle-exclamation', 'Reclamações', 'Diagnostique e encaminhe soluções'],
    ['kb', 'fa-solid fa-book-open', 'Base de Conhecimento', 'Consulte e amplie as soluções cadastradas']
  ]
};

export const THEME_META = [['light', 'Claro'], ['dark', 'Escuro'], ['hcb', 'Alto contraste preto'], ['hcw', 'Alto contraste branco']];
export const SCALES = [0.875, 1, 1.125, 1.25, 1.375, 1.5];

const h = (when, who, what) => ({ when, who, what });

export const SEED = [
  { id: '2026-004812', subject: 'Cobrança duplicada na fatura de outubro', desc: 'Fui cobrada duas vezes no cartão pela mesma fatura de outubro. Preciso do estorno de uma das cobranças.', client: 'Marina Costa', type: null, status: 'recebida', prio: 'Alta', created: '27/10 09:12', updated: '27/10 09:12', owner: 'Fila de atendimento', files: ['fatura-outubro.pdf'], history: [h('27/10 09:12', 'Sistema', 'Notificação de recebimento enviada'), h('27/10 09:12', 'Marina Costa', 'Solicitação registrada')] },
  { id: '2026-004809', subject: 'Como alterar o endereço de entrega?', desc: 'Mudei de endereço e quero atualizar para os próximos pedidos.', client: 'João Pereira', type: 'info', status: 'atendimento', prio: 'Baixa', created: '27/10 08:40', updated: '27/10 08:55', owner: 'Carla Mendes', files: [], history: [h('27/10 08:55', 'Carla Mendes', 'Classificou como Solicitação de Informação'), h('27/10 08:40', 'João Pereira', 'Solicitação registrada')] },
  { id: '2026-004805', subject: 'Produto chegou danificado', desc: 'A caixa veio amassada e o produto está com a tela trincada.', client: 'Marina Costa', type: 'recl', status: 'departamento', prio: 'Alta', created: '26/10 17:20', updated: '26/10 17:45', owner: 'Departamento de Atendimento', files: ['foto-produto.jpg'], history: [h('26/10 17:45', 'Sistema', 'Encaminhada ao Departamento de Atendimento'), h('26/10 17:44', 'Carla Mendes', 'Classificou como Reclamação'), h('26/10 17:20', 'Marina Costa', 'Solicitação registrada')] },
  { id: '2026-004801', subject: 'Não consigo acessar minha conta', desc: 'A senha não funciona desde ontem, mesmo depois de redefinir.', client: 'Luísa Ramos', type: null, status: 'recebida', prio: 'Média', created: '26/10 16:02', updated: '26/10 16:02', owner: 'Fila de atendimento', files: [], history: [h('26/10 16:02', 'Luísa Ramos', 'Solicitação registrada')] },
  { id: '2026-004797', subject: 'Prazo de reembolso no boleto', desc: 'Cancelei um pedido pago no boleto. Em quanto tempo recebo o valor?', client: 'Pedro Alves', type: 'info', status: 'entregue', prio: 'Média', created: '26/10 11:30', updated: '26/10 14:10', owner: 'Carla Mendes', files: [], response: 'O reembolso de boleto cai em até 5 dias úteis na conta informada.', article: 'Prazos de reembolso por forma de pagamento', history: [h('26/10 14:10', 'Carla Mendes', 'Entregou a solução ao cliente'), h('26/10 11:50', 'Carla Mendes', 'Classificou como Solicitação de Informação'), h('26/10 11:30', 'Pedro Alves', 'Solicitação registrada')] },
  { id: '2026-004790', subject: 'Taxa de serviço não informada', desc: 'Apareceu uma taxa de R$ 9,90 que não estava no resumo da compra.', client: 'Marina Costa', type: 'recl', status: 'encerrada', prio: 'Média', created: '24/10 10:05', updated: '25/10 15:30', owner: 'Carla Mendes', files: [], response: 'A taxa foi estornada e o resumo da compra foi corrigido.', history: [h('25/10 15:30', 'Sistema', 'Cliente notificado · pesquisa de satisfação enviada'), h('25/10 15:29', 'Carla Mendes', 'Encerrou a solicitação'), h('25/10 15:20', 'Carla Mendes', 'Entregou a solução ao cliente'), h('24/10 10:05', 'Marina Costa', 'Solicitação registrada')] },
  { id: '2026-004782', subject: 'Segunda via de nota fiscal', desc: 'Preciso da nota fiscal do pedido de setembro.', client: 'Ana Lima', type: 'info', status: 'encerrada', prio: 'Baixa', created: '23/10 09:00', updated: '23/10 10:12', owner: 'Carla Mendes', files: [], rating: 5, response: 'Enviamos a segunda via para o seu e-mail.', history: [h('23/10 10:40', 'Ana Lima', 'Avaliou o atendimento com nota 5'), h('23/10 10:12', 'Carla Mendes', 'Encerrou a solicitação'), h('23/10 09:00', 'Ana Lima', 'Solicitação registrada')] },
  { id: '2026-004779', subject: 'Atraso na entrega do pedido', desc: 'O pedido deveria chegar dia 20 e ainda não tem atualização de rastreio.', client: 'Bruno Dias', type: 'recl', status: 'atendimento', prio: 'Alta', created: '22/10 13:15', updated: '27/10 08:10', owner: 'Carla Mendes', files: [], fromDept: true, diagnosis: 'Extravio na transportadora; reenvio liberado.', solTitle: 'Reenvio de pedido extraviado', solBody: 'Confirmamos o extravio com a transportadora e liberamos o reenvio sem custo. O novo código de rastreio chega por e-mail em até 24 h.', history: [h('27/10 08:10', 'Rafael Souza', 'Encaminhou a solução ao atendente'), h('26/10 15:00', 'Rafael Souza', 'Registrou diagnóstico · problema conhecido'), h('22/10 13:20', 'Carla Mendes', 'Classificou como Reclamação'), h('22/10 13:15', 'Bruno Dias', 'Solicitação registrada')] }
];

export const KB = [
  { id: 1, title: 'Estorno de cobrança duplicada', cat: 'Financeiro', upd: '12/10', body: 'Confirme as duas transações no extrato, abra o estorno da mais recente no painel financeiro e informe ao cliente o prazo de até 2 faturas para o crédito aparecer.' },
  { id: 2, title: 'Alterar endereço de entrega', cat: 'Cadastro', upd: '02/10', body: 'O cliente altera em Minha conta › Endereços. Pedidos já faturados mantêm o endereço original; para esses, solicite redirecionamento à transportadora.' },
  { id: 3, title: 'Prazos de reembolso por forma de pagamento', cat: 'Financeiro', upd: '20/09', body: 'Pix: até 1 dia útil. Boleto: até 5 dias úteis na conta informada. Cartão: até 2 faturas, conforme o banco emissor.' },
  { id: 4, title: 'Recuperar acesso à conta', cat: 'Acesso', upd: '15/10', body: 'Verifique se o e-mail está correto, envie o link de redefinição e, se falhar duas vezes, desbloqueie a conta no painel de segurança.' },
  { id: 5, title: 'Troca de produto danificado na entrega', cat: 'Logística', upd: '08/10', body: 'Peça foto da embalagem e do produto, gere a etiqueta de devolução sem custo e libere o envio do novo item assim que a coleta for registrada.' },
  { id: 6, title: 'Emissão de segunda via de nota fiscal', cat: 'Fiscal', upd: '30/09', body: 'Acesse o pedido no painel, clique em Documentos › Reenviar nota fiscal. O PDF e o XML vão para o e-mail cadastrado.' }
];

// ---------- helpers ----------

export const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const pad = n => String(n).padStart(2, '0');
export const nowStr = () => { const d = new Date(); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
export const mkHistory = h;

// 'dd/mm hh:mm' -> número comparável (as datas do protótipo não têm ano)
export const tsOf = s => { const m = /^(\d+)\/(\d+) (\d+):(\d+)$/.exec(s || ''); return m ? ((+m[2] * 31 + +m[1]) * 24 + +m[3]) * 60 + +m[4] : 0; };

export const typeLabel = t => t.type === 'info' ? 'Informação' : t.type === 'recl' ? 'Reclamação' : 'A classificar';
export const needsRate = t => t.status === 'encerrada' && !t.rating;

export const visibleTo = (user, tickets) =>
  tickets.filter(t => user.role === 'cliente' ? t.client === user.name : user.role === 'departamento' ? t.type === 'recl' : true);

export const kbSearch = (kb, q) => { const n = norm(q); return kb.filter(a => !n || n.split(/\s+/).every(w => norm(a.title + ' ' + a.body + ' ' + a.cat).includes(w))); };
export const snip = a => a.body.slice(0, 70) + '…';
