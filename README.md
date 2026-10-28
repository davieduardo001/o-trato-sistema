# Trato

> **Toda solicitação tem retorno.**
> Canal aberto 24 h, 7 dias · Registro → Análise → Solução → Retorno

Trato é um sistema de acompanhamento de solicitações. Clientes e equipe entram pelo mesmo portal, cada um com o seu perfil, e todo pedido percorre quatro etapas visíveis: **Registro, Análise, Solução e Retorno**.

Este repositório contém o **Service Desk** do Trato: login, painel por perfil (cliente, atendente e Departamento de Atendimento), fila de chamados, tela de chamado com as ações de cada etapa, Base de Conhecimento, ajuda e painel de acessibilidade (4 temas, tamanho de texto e Libras). É responsivo, de tela cheia no desktop e com menu em gaveta no mobile.

É um app estático (Preact + htm, sem build). Chamados e Base de Conhecimento ficam no `localStorage` do navegador, então o fluxo inteiro funciona no GitHub Pages sem back-end. Para ver, sirva a pasta com qualquer servidor estático:

```
python3 -m http.server
```

Usuários de teste (qualquer senha): `marina` (cliente), `carla` (atendente), `rafael` (Depto. de Atendimento). No menu do perfil há "Restaurar dados de demonstração".

```
index.html          # entrada do app
js/                 # main.js (rotas, tema, atalhos), store.js (estado + localStorage), data.js (dados de exemplo)
  views/            # login, início, fila, chamado, nova solicitação, minhas solicitações, base, ajuda
  components/       # shell (cabeçalho, menu, acessibilidade, avisos), arte do login, peças de UI
styles/             # tokens dos 4 temas, base, login e app
vendor/             # Preact + htm (autocontido)
fonts/              # Schibsted Grotesk (woff2)
docs/service-desk/  # inventário de telas, matriz de conformidade com o docx BPMN e capturas do protótipo
assets/             # protótipos originais (login e Service Desk), mantidos como referência de design
```

O fluxo implementado é o do protótipo (processo AS-IS do docx de requisitos). A comparação com o TO-BE e as lacunas estão em [`docs/service-desk/conformidade.md`](docs/service-desk/conformidade.md).

---

# Tese: desenvolver em grupo, com IA, e já implantar em ambiente de testes

## 1. Resumo

Este projeto foi feito em **poucas horas de alinhamento de requisitos**, em grupo, com uma IA generativa como parceira de desenvolvimento. A hipótese é que a IA não serve só para escrever código mais rápido. O ganho maior é **mover o tempo da equipe da digitação para a discussão**. Com o custo de produzir uma versão navegável quase zerado, sobra mais tempo para debater funcionalidades, priorizar melhorias e redesenhar o diagrama do sistema. O deploy em ambiente de testes entra logo no começo, para simular uma esteira ágil de desenvolvimento.

## 2. Problema

Num fluxo tradicional de levantamento de requisitos, a maior parte do tempo vai para:

1. escrever documentos que ninguém lê depois;
2. esperar alguém transformar a conversa em tela ou código;
3. descobrir tarde, só no primeiro deploy, que o entendimento não era o mesmo.

O grupo conversa muito e vê pouco. A conversa só é validada quando já está cara de mudar.

## 3. Hipótese

> Se a IA reduz o tempo entre **ideia → artefato navegável** para minutos, o grupo pode gastar as horas de alinhamento **discutindo o que construir**, e não esperando alguém construir.

E, se o artefato já nasce implantável, o ciclo de feedback passa a ser **ideia → ambiente de testes**, e não **ideia → documento → reunião → protótipo → deploy**.

## 4. Método

O fluxo foi dividido em ciclos curtos. Cada ciclo fechava com algo que podia ser aberto e criticado.

| Etapa | O que o grupo fez | O que a IA fez |
|-------|-------------------|----------------|
| **1. Alinhamento** | Discutiu quem usa o Trato, que dores existem e o que é prioridade. | Registrou decisões, devolveu o entendimento em texto curto e apontou lacunas e ambiguidades. |
| **2. Desenho** | Debateu melhorias de funcionalidade e redesenhou o **diagrama** do sistema. | Propôs variações de fluxo e de diagrama para o grupo comparar e escolher. |
| **3. Protótipo** | Revisou a tela como um usuário a revisaria. | Gerou a tela de login (desktop e mobile) a partir do que foi decidido. |
| **4. Deploy em teste** | Abriu o resultado num ambiente de testes e deu feedback sobre algo rodando. | Preparou o artefato para ser publicado e o repositório para a esteira. |
| **5. Ajuste** | Voltou à discussão com o que viu. | Aplicou os ajustes e reiniciou o ciclo. |

### Esteira ágil simulada

A esteira foi pensada para que **nenhuma decisão ficasse só no papel**:

```
requisito  →  discussão em grupo  →  IA gera/ajusta  →  commit  →  ambiente de testes  →  feedback  →  (volta)
```

Mesmo com um protótipo pequeno, o grupo percorreu o caminho inteiro: do requisito ao ambiente de testes. Isso expõe cedo os problemas de entrega, como organização do repositório, nomes de arquivo e o que de fato é publicado, que normalmente só aparecem no fim.

## 5. Divisão de papéis

- **Grupo:** decide o *quê* e o *porquê*. Define prioridades, critérios de aceite e o diagrama final.
- **IA:** executa o *como* em velocidade de conversa. Gera, ajusta, explica e organiza.
- **Regra do grupo:** a IA propõe e a equipe aprova. Nada entra no repositório sem alguém do grupo ter visto.

## 6. Resultados observados

- **Mais tempo de discussão.** O esforço que iria para escrever tela e código foi para o debate de funcionalidades e para o novo diagrama.
- **Feedback sobre algo concreto.** O grupo reagiu a uma tela real, não a uma descrição.
- **Deploy desde o começo.** O ambiente de testes deixou de ser uma etapa final e virou parte do ritmo do trabalho.
- **Requisitos fechados em poucas horas.** O alinhamento terminou com um protótipo versionado, não com uma ata.

## 7. Limites e cuidados

Esta é uma experiência de curta duração, com um protótipo de uma tela. Os resultados acima são **observações do grupo**, não medições controladas.

- O protótipo é apenas de **interface**. Não há autenticação real nem back-end.
- A IA acelera a produção, mas **não substitui a decisão**: se o grupo não souber o que quer, ela gera rápido a coisa errada.
- Código gerado precisa de revisão humana antes de ir para um ambiente que não seja de testes.
- A conclusão depende de repetir o fluxo em escopos maiores.

## 8. Próximos passos

- [ ] Publicar o protótipo em um ambiente de testes com URL fixa
- [ ] Adicionar o diagrama redesenhado ao repositório
- [ ] Implementar autenticação real (cliente e equipe)
- [ ] Implementar consulta por nº de protocolo
- [ ] Automatizar o deploy a cada commit na `main`
- [ ] Medir o tempo de ciclo em um escopo maior para validar a hipótese

## 9. Conclusão

Com IA no fluxo, o gargalo do alinhamento de requisitos deixa de ser a produção e passa a ser a decisão. Isso é uma boa troca: o tempo do grupo vai para a parte que só pessoas podem fazer, e o deploy em ambiente de testes mantém a conversa ligada a algo que roda.
