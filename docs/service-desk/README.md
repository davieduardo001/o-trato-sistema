# Service Desk: inventário de telas do protótipo

Fonte: `assets/Trato - Service Desk.html` (bundle de um único arquivo, React via `DCLogic`).
Este documento descreve **o que o protótipo faz hoje**, tela a tela. A comparação com os requisitos está em [`conformidade.md`](conformidade.md).

As capturas em [`telas/`](telas/) foram geradas do próprio protótipo, em 1440×900 (desktop) e 390×844 (mobile), com os usuários de teste.

## 1. Visão geral

| Item | Como está no protótipo |
|------|------------------------|
| **Perfis** | `cliente` (Marina Costa), `atendente` (Carla Mendes), `departamento` (Rafael Souza). Login com qualquer senha. |
| **Status** | `recebida` → `atendimento` → `departamento` (só reclamações) → `entregue` → `encerrada` |
| **Tipos** | `info` (Solicitação de Informação), `recl` (Reclamação), `null` (ainda a classificar) |
| **Prioridade** | Alta / Média / Baixa, valor fixo no seed. A tela de nova solicitação cria sempre "Média". |
| **Dados** | 8 chamados de exemplo (`SEED`) e 6 artigos de Base de Conhecimento (`KB`), em memória. Nada persiste, exceto as preferências de acessibilidade em `localStorage`. |
| **Protocolo** | `AAAA-NNNNNN` (ex.: `2026-004812`), gerado como o maior número + 1. |
| **Estado global** | Um único componente (`state`: usuário, view, chamado aberto, formulários, tema, etc.). A navegação é por `view`, sem rotas/URLs. |
| **Transversais** | Menu lateral recolhível, breadcrumbs, toasts com **Desfazer**, modal de confirmação, painel de acessibilidade, toolbar "Pular para o conteúdo". |

### Ações por perfil e etapa (tela de chamado)

| Perfil | Status do chamado | Ação disponível |
|--------|-------------------|-----------------|
| Atendente | `recebida` | **Analisar e classificar**: texto de análise (opcional) + Informação ou Reclamação. Informação → `atendimento` (fica com ele). Reclamação → `departamento`. |
| Atendente | `atendimento` | **Responder ao cliente**: busca na Base, anexa artigo, redige a resposta e **Entrega solução** → `entregue`. Também tem "Gerar relatório" (só mostra um aviso). Se veio do Departamento, mostra a solução e o diagnóstico. |
| Atendente | `entregue` | **Encerrar solicitação** (com confirmação) → `encerrada`; "cliente notificado e recebe pesquisa". |
| Departamento | `departamento` | **Diagnosticar reclamação**: diagnóstico + "problema conhecido?". Sim: escolhe uma solução sugerida da Base. Não: cadastra título e passos de uma **nova solução**, que entra na Base. Em ambos os casos → `atendimento`, de volta ao atendente. |
| Cliente | `encerrada` sem nota | **Avaliar** de 1 a 5. |
| Cliente | qualquer outro | Nenhuma ação. A tela diz "Nenhuma ação sua agora". |

## 2. Inventário de telas

### 2.1 Acesso

| # | Tela | Perfil | O que tem | Captura |
|---|------|--------|-----------|---------|
| A1 | **Login** | todos | Marca + "Service Desk", usuário, senha (mostrar/ocultar), "Manter conectado", "Esqueci a senha" (só mostra aviso), botão Entrar com estado de carregamento, atalhos de usuários de teste. Arte lateral (anéis e ondas). | [00](telas/00-login.jpg) |
| A2 | Login com erro | todos | Alerta "Preencha usuário e senha para entrar." com borda de erro nos campos. | [01](telas/01-login-erro-vazio.jpg) |
| A3 | Confirmar saída | todos | Modal "Sair do sistema?" aberto pelo menu do perfil. | [19c](telas/19c-confirmar-sair.jpg) |

> O login do protótipo ainda é um artboard fixo 1240×800 escalado por JS. É o mesmo problema que já corrigimos em `index.html`.

### 2.2 Shell (todas as telas internas)

Cabeçalho (menu, marca, botão **Acessibilidade**, menu do perfil com Sair), menu lateral por perfil com contador de pendências, breadcrumbs e área de conteúdo. Menu por perfil:

| Perfil | Itens |
|--------|-------|
| Cliente | Início · Nova solicitação · Minhas solicitações · Ajuda |
| Atendente | Início · Fila de chamados · Base de Conhecimento · Ajuda |
| Departamento | Início · Reclamações · Base de Conhecimento · Ajuda |

### 2.3 Início (dashboard)

Saudação por horário, frase de contexto, botão principal (Nova solicitação / Abrir fila / Diagnosticar), **cartões de resumo** clicáveis, "Seus módulos" e lista de recentes.

| Perfil | Cartões | Captura |
|--------|---------|---------|
| Cliente | Em andamento · Para avaliar · Encerradas | [10](telas/10-cliente-home.jpg) |
| Atendente | Novas na fila · Em atendimento · No Departamento · Para encerrar | [20](telas/20-atendente-home.jpg) |
| Departamento | Para diagnosticar · Com atendente · Encerradas · Soluções na base | [30](telas/30-depto-home.jpg) |

### 2.4 Cliente

| # | Tela | O que tem | Captura |
|---|------|-----------|---------|
| C1 | **Nova solicitação** | Assunto\*, descrição\*, anexos (opcional, só guarda o nome), aviso de LGPD, Enviar/Cancelar. | [11](telas/11-cliente-nova.jpg) |
| C2 | Nova solicitação com erro | Alerta "Preencha os campos obrigatórios" + erro por campo. | [12](telas/12-cliente-nova-erro.jpg) |
| C3 | Solicitação registrada | Confirmação com **número de protocolo**, e-mail de destino da confirmação, "Acompanhar solicitação" / "Registrar outra". | [13](telas/13-cliente-nova-ok.jpg) |
| C4 | **Minhas solicitações** | Busca por protocolo + cartões (protocolo, status, assunto, atualizado, selo "Avaliar"). | [14](telas/14-cliente-minhas.jpg) |
| C5 | Chamado encerrado (avaliar) | Linha de andamento, resposta entregue, **nota 1 a 5**, detalhes e histórico. | [15](telas/15-cliente-ticket-encerrada-avaliar.jpg), [16](telas/16-cliente-ticket-nota-escolhida.jpg) |

### 2.5 Atendente

| # | Tela | O que tem | Captura |
|---|------|-----------|---------|
| T1 | **Fila de chamados** | Busca (protocolo/assunto/cliente), filtros por status com contagem, tabela: protocolo, assunto·cliente, tipo, prioridade, status, atualizado. Ordenada por status e prioridade. | [21](telas/21-atendente-fila.jpg) |
| T2 | Chamado a classificar | Análise (opcional) + escolha Informação/Reclamação + Confirmar (desabilitado com dica). | [22](telas/22-atendente-ticket-classificar.jpg), [23](telas/23-atendente-classificar-selecionado.jpg) |
| T3 | Chamado a responder | Busca na Base, **Anexar** artigo (preenche a resposta), resposta\*, Entregar solução, Gerar relatório. | [24](telas/24-atendente-ticket-responder.jpg), [25](telas/25-atendente-responder-artigo.jpg) |
| T4 | Chamado com solução do Departamento | Faixa com solução e diagnóstico; resposta já preenchida; sem busca na Base. | [28](telas/28-atendente-solucao-do-depto.jpg) |
| T5 | Chamado a encerrar | Botão Encerrar + modal de confirmação. | [26](telas/26-atendente-ticket-encerrar.jpg), [27](telas/27-atendente-confirmar-encerrar.jpg) |

### 2.6 Departamento

| # | Tela | O que tem | Captura |
|---|------|-----------|---------|
| D1 | **Reclamações** | Mesma lista da fila, filtrada para `recl`. | [31](telas/31-depto-fila.jpg) |
| D2 | **Diagnosticar reclamação** | Diagnóstico\*, "conhecido?"; Sim → soluções sugeridas por palavras do chamado; Não → título + passos da nova solução. | [32](telas/32-depto-diagnostico.jpg), [33](telas/33-depto-conhecido.jpg), [34](telas/34-depto-novo.jpg) |

### 2.7 Compartilhadas

| # | Tela | O que tem | Captura |
|---|------|-----------|---------|
| S1 | **Base de Conhecimento** | Busca (todas as palavras), contador, artigos em acordeão (título, categoria, atualização, corpo). **Somente leitura.** | [29](telas/29-base-conhecimento.jpg) |
| S2 | **Ajuda** | Glossário dos 5 status, resumo de acessibilidade, contato do suporte. | [17](telas/17-ajuda.jpg) |
| S3 | **Painel de acessibilidade** | 4 temas (claro, escuro, alto contraste preto/branco), texto 87%–150%, intérprete de **Libras** (área reservada para VLibras), restaurar padrão, atalhos Alt+1/2/3 e Esc. | [18](telas/18-painel-acessibilidade.jpg), [19](telas/19-cliente-minhas-escuro.jpg), [19b](telas/19b-minhas-alto-contraste.jpg) |
| S4 | **Tela de chamado** (estrutura comum) | Protocolo, status, tipo, prioridade, título, **linha de andamento** (4 etapas, ou 5 para reclamação), descrição, anexos, resposta entregue, painel lateral Detalhes e **Histórico** (quando, quem, o quê). | [22](telas/22-atendente-ticket-classificar.jpg) |

### 2.8 Mobile (390×844)

[40 login](telas/40-mobile-login.jpg) · [41 início](telas/41-mobile-home.jpg) · [42 fila](telas/42-mobile-fila.jpg) · [43 chamado](telas/43-mobile-ticket.jpg)

Problemas vistos: o menu lateral ocupa uma faixa fixa de 72px, o cabeçalho espreme a marca e o botão de acessibilidade fica cortado, e o login continua sendo um artboard escalado.

## 3. Componentes reutilizáveis a extrair

Padrões que aparecem em várias telas e devem virar componentes (não copiar markup):

- **StatusBadge** (ícone + rótulo + cor, com variante de alto contraste)
- **Stepper** de andamento (concluída / atual / pendente)
- **Timeline** de histórico
- **Radio em cartão** (classificação, "conhecido?", soluções sugeridas)
- **Botão primário** com estado desabilitado tracejado + dica ao lado
- **Campo** com rótulo, `aria-invalid`, mensagem de erro
- **Toast** com Desfazer · **Modal de confirmação** · **Cartão de resumo (KPI)**
- **Tema por tokens** (`--bg`, `--sf`, `--tx`, `--ac`… para os 4 temas), com escala de fonte global

## 4. Dados do protótipo (modelo implícito)

```
Chamado  { id, subject, desc, client, type, status, prio, created, updated, owner,
           files[], history[{when,who,what}],
           analysis?, response?, article?, rating?,
           fromDept?, diagnosis?, solTitle?, solBody? }
Artigo   { id, title, cat, upd, body }
Usuário  { name, role, email }
```
