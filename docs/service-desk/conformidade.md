# Service Desk: protótipo × documentação (BPMN TO-BE)

Comparação entre `assets/Trato - Service Desk.html` e `Atendimento_ao_Cliente_BPMN_Requisitos.docx` (RF01–RF15, RNF01–RNF07, HU01–HU05 e diagrama TO-BE, Figura 2).

## 1. Conclusão

**O protótipo implementa o processo AS-IS (Figura 1), com acabamento de produto, não o TO-BE (Figura 2).**

Ele cobre bem o que existia antes (registrar → classificar → responder/diagnosticar → entregar → encerrar → pesquisa), mas **nenhum dos três pontos de melhoria** que o grupo propôs está nele:

| Melhoria do docx (§3) | No protótipo |
|-----------------------|--------------|
| Aceite da resposta pelo cliente (aceitar / recusar / complementar / reabrir) | **Ausente.** Quem encerra é o atendente. O cliente só vê "Nenhuma ação sua agora". |
| Níveis N1, N2, N3 e Desenvolvimento | **Ausente.** Só existem Atendente e "Departamento de Atendimento" (o AS-IS). |
| NPS separado do aceite | **Parcial.** Existe a pesquisa após o encerramento, mas é uma nota de **1 a 5**, não o NPS de 0 a 10 (HU05). |

Dá para reaproveitar quase todo o desenho visual e os componentes. O que muda é o **modelo de processo** (perfis, status e transições), que fica na base de tudo. Por isso, e para não construir sobre o fluxo errado, o ideal é fechar o modelo antes de codar (seções 8 e 9).

## 2. O que o diagrama TO-BE exige (e o texto do docx não detalha)

Lido da Figura 2, `bpmn/to-be.png`:

1. **Cinco raias:** Cliente · Atendente N1 · Suporte N2 · Especialista N3 · Desenvolvimento/Melhoria.
2. **A decisão do N1 mudou.** No AS-IS era "Reclamação ou Informação?". No TO-BE é **"Resolvível no N1?"**. Sim: responde com a Base de Conhecimento. Não: vai para o N2. A classificação Informação/Reclamação deixa de rotear o chamado.
3. **N2:** "Problema conhecido?" Sim → aplica a solução conhecida. Não → N3.
4. **N3:** "Exige alteração no sistema?" Não → elabora solução de contorno. Sim → Desenvolvimento registra a demanda de melhoria, desenvolve e implanta a correção.
5. **Todos os caminhos voltam ao N1.** N2, N3 e Desenvolvimento entregam a solução **ao N1**, e é o N1 quem faz "Entregar solução" ao cliente. (O protótipo já faz isso para o Departamento.)
6. **Aceite:** o cliente avalia a resposta. "Solicitação atendida?" Sim → **chamado encerrado** (notificação) → responde NPS → fim. Não → **Complementar solicitação**, que volta para "Analisar e classificar" no N1.

## 3. Requisitos funcionais

Legenda: ✅ atende · 🟡 parcial · ❌ ausente · ⚠️ conflita

| RF | Requisito | Situação | Observação |
|----|-----------|:--------:|------------|
| RF01 | Cliente registra solicitação (assunto, descrição, anexos opcionais) | ✅ | Tela C1. Anexos guardam só o nome do arquivo (sem upload). |
| RF02 | Notificação de recebimento com protocolo | 🟡 | Tela C3 mostra o protocolo e diz "enviamos para {e-mail}". É só texto e uma linha de histórico, sem envio real. |
| RF03 | N1 analisa e classifica | 🟡 | O Atendente faz isso (T2), mas classifica em Informação/Reclamação (lógica AS-IS), não "resolvível no N1?". |
| RF04 | Consulta à Base de Conhecimento durante o atendimento | ✅ | Busca e **Anexar** na tela T3, mais a tela S1. |
| RF05 | Escalar N1 → N2 → N3 → Dev preservando histórico | ❌ | Só há Atendente → Departamento (e de volta). O histórico existe e é preservado. |
| RF06 | N2 registra diagnóstico e indica se o problema é conhecido | 🟡 | O Departamento faz (D2), mas é um perfil único. "Não conhecido" cadastra a solução ali mesmo em vez de escalar ao N3. |
| RF07 | N3 registra causa raiz e solução de contorno | ❌ | Não existe. |
| RF08 | Registrar demanda de melhoria para o Desenvolvimento | ❌ | Não existe. |
| RF09 | Cadastrar novas soluções na Base | 🟡 | Só como efeito do "problema novo" no diagnóstico. A tela S1 é somente leitura (sem criar, editar ou arquivar). |
| RF10 | N1 entrega a solução ao cliente | ✅ | "Entregar solução" na tela T3. |
| RF11 | Cliente aceita ou recusa a resposta | ❌ | Não existe. |
| RF12 | Reabrir ao recusar, com complemento do cliente | ❌ | Não existe. |
| RF13 | Encerrar somente após o aceite do cliente | ⚠️ | O atendente encerra sozinho (T5), sem aceite. Contradiz o requisito. |
| RF14 | Enviar NPS após o encerramento | 🟡 | A pesquisa existe e não reabre o chamado, mas a escala é 1–5. |
| RF15 | Cliente acompanha o status pelo protocolo | 🟡 | "Minhas solicitações" busca por protocolo (C4), mas só **logado**. O login do Service Desk não tem "acompanhar sem entrar". |

**Resumo:** 3 ✅ · 6 🟡 · 5 ❌ · 1 ⚠️ (15 requisitos)

## 4. Requisitos não funcionais

| RNF | Requisito | Situação | Observação |
|-----|-----------|:--------:|------------|
| RNF01 | Notificações em até 1 min | ❌ | Depende de backend (e-mail ou fila). O protótipo só simula. |
| RNF02 | Busca na Base em até 2 s | 🟡 | A busca local é instantânea (6 artigos). Precisa de índice quando a Base crescer. |
| RNF03 | Histórico com data, hora, **nível**, responsável e ação | 🟡 | Tem quando, quem e o quê. **Falta o nível.** |
| RNF04 | Acesso por perfil: Cliente, N1, N2, N3, Dev | 🟡 | 3 perfis. Faltam N3 e Dev, e N1/N2 estão fundidos em Atendente/Departamento. |
| RNF05 | LGPD | 🟡 | Só o aviso na tela C1. Faltam base legal, política, retenção e consentimento. |
| RNF06 | Telas do cliente responsivas | 🟡 | Tem breakpoints, mas no mobile o menu lateral fixo e o cabeçalho quebram (ver README §2.8). O login é um artboard escalado. |
| RNF07 | Canal de registro 24 h × 7 | — | Infraestrutura (hospedagem), não é tela. |

## 5. Histórias de usuário (BDD)

| HU | Cenário | Situação | Observação |
|----|---------|:--------:|------------|
| HU01 | Registro com sucesso (status "Recebida", notificação com protocolo) | ✅ | Texto do botão e do status batem com o docx. |
| HU01 | Campos obrigatórios (mensagem "Preencha os campos obrigatórios") | ✅ | Idêntico. |
| HU02 | Solução encontrada → anexar artigo, status **"Aguardando aceite do cliente"** | 🟡 | Anexa o artigo, mas o status vira "Solução entregue" e não existe o aceite. |
| HU02 | Solução não encontrada → habilitar **"Escalar para N2"** | ❌ | Só mostra "Nenhum resultado, redija manualmente". |
| HU03 | N2 → N3 ("Escalar para N3", fila do N3, histórico visível) | ❌ | Não existe. |
| HU03 | N3 → Desenvolvimento (demanda vinculada ao protocolo + notificar Dev) | ❌ | Não existe. |
| HU04 | Cliente aceita ("Minha solicitação foi atendida") → encerra e notifica | ❌ | Não existe. |
| HU04 | Cliente recusa ("Não foi atendida" + o que faltou) → status "Reaberta" → fila do N1 | ❌ | Não existe. |
| HU05 | Envio do NPS após o encerramento | 🟡 | Registrado no histórico, sem tela de convite. |
| HU05 | Resposta 0–10 vinculada ao protocolo, sem reabrir | 🟡 | Vincula ao protocolo e não reabre, mas a escala é 1–5. |

## 6. O que o protótipo tem e o docx não pede

Valor agregado, mas fora do escopo documentado. Convém decidir se entra:

- **Painel de acessibilidade completo:** 4 temas (incluindo alto contraste), escala de texto 87%–150%, intérprete de Libras (VLibras), atalhos de teclado, link "pular para o conteúdo".
- **Prioridade** Alta/Média/Baixa (o docx não fala em prioridade nem em SLA) e ordenação da fila por ela.
- **Dashboard de início** com cartões de resumo por perfil.
- **"Gerar relatório"** (o diagrama AS-IS tem o artefato "Relatório", mas não há RF).
- **Desfazer** em ações do atendente, confirmação antes de encerrar, breadcrumbs, glossário de status (Ajuda).

## 7. Divergências de produto a resolver

1. **Quem é o cliente?** O login diz "Sistema interno. Use seu usuário e senha **corporativos**", mas o docx descreve um **cliente externo** que registra solicitação e acompanha por protocolo. Falta também o cadastro/entrada do cliente.
2. ~~Dois logins.~~ Resolvido: há um login só (ver seção 9).
3. **Pesquisa 1–5 × NPS 0–10.** O NPS tem faixas próprias (detratores 0–6, neutros 7–8, promotores 9–10) e cálculo agregado. 1–5 é CSAT.

## 8. Modelo proposto para o TO-BE (a validar com o grupo)

Os nomes em **negrito** vêm do docx. Os demais são proposta minha.

**Perfis:** Cliente · N1 · N2 · N3 · Desenvolvimento

**Status:**

| Status | Quando | Responsável |
|--------|--------|-------------|
| **Recebida** | cliente registrou | fila do N1 |
| Em atendimento (N1) | N1 assumiu, ou recebeu solução de N2/N3/Dev para entregar | N1 |
| Em análise (N2) | N1 escalou | N2 |
| Em investigação (N3) | N2 indicou problema desconhecido | N3 |
| Em desenvolvimento | N3 indicou alteração no sistema | Dev |
| **Aguardando aceite do cliente** | N1 entregou a solução | Cliente |
| **Reaberta** | cliente recusou e complementou; volta à fila do N1 | N1 |
| Encerrada | cliente aceitou | — (NPS pendente) |

**Transições (espelham o diagrama):**

```
Recebida ─N1 resolve (Base)──────────────────────────────┐
   │                                                     ▼
   └─não resolve→ N2 ─conhecido→ aplica solução ──→ [N1 entrega] → Aguardando aceite ─aceita→ Encerrada → NPS 0–10
                   │                                     ▲                  │
                   └─desconhecido→ N3 ─sem alteração─────┤                  └─recusa + complemento→ Reaberta → fila N1
                                    │                    │
                                    └─exige alteração→ Dev (demanda → correção)
```

**Cada evento do histórico grava:** data, hora, **nível**, responsável, ação (RNF03).

## 9. Decisões tomadas

| Tema | Decisão |
|------|---------|
| Escopo | **Só o que o protótipo tem** (fluxo AS-IS). O TO-BE ficou fora do código; as lacunas das seções 3 a 5 continuam valendo e servem de backlog. |
| Cliente | **Externo.** O login unificou o design do `index.html` publicado com o formulário do Service Desk (e-mail ou usuário, "Sou cliente / Sou da equipe"). O acompanhamento por protocolo **sem login** (RF15) não foi implementado, porque o protótipo não tem essa tela. |
| Extras | **Mantidos todos** (acessibilidade completa, prioridade, dashboard, "Gerar relatório"). |
| Persistência | **`localStorage`**, sem back-end. Notificações (RF02, RNF01) continuam simuladas. |
