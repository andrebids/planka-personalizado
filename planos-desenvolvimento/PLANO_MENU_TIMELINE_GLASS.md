## Objetivo

- **Criar um menu lateral direito (ocultável)** no ecrã de quadro com o tema "liquid glass" já aplicado no projeto.
- **Botão de abrir/fechar** próximo do botão de ações do quadro (na área `BoardActions > RightSide`).
- **Conteúdo do menu**: timeline de acontecimentos (atividades) do projeto/quadro, reutilizando a lógica/markup do modal atual de histórico de ações.
- **Após conclusão**: remover o modal de histórico para evitar duplicação.

## Requisitos funcionais e UX

- **Localização do botão**: ao lado do botão que abre o menu de ações do quadro (`RightSide.jsx`), com ícone de histórico (ex.: `history`).
- **Comportamento do painel**: desliza da direita; fecha ao clicar no botão novamente, ao clicar fora (backdrop) e com tecla `Esc`.
- **Tema "liquid glass"**: usar classes existentes (`glass-panel`, `glass-perfect-card`) e estilos compatíveis; sem alterar a paleta.
- **Conteúdo**: lista infinita das atividades do quadro, como no modal `BoardActivitiesModal` (mesma renderização dos itens e `useInView`).
- **Acessibilidade**: foco inicial no cabeçalho do painel; `Esc` fecha; elementos com `aria-label` e `role` apropriados.

## Arquitetura da solução

- **Estado (Redux)**: adicionar um slice simples para o painel de timeline (ex.: `timelinePanelReducer`) com `isOpen: boolean`.
- **Ações/Entry-Actions**: ações para `toggle` e `setOpen` do painel.
- **Seletores**: seletor para `isTimelinePanelOpen`.
- **Componente do painel**: `BoardActivitiesPanel` (drawer à direita), importado no layout fixo (`Fixed.jsx`) para ficar sobre o conteúdo do quadro.
- **Integração**: botão extra em `RightSide.jsx` para abrir/fechar o painel.
- **Reutilização de conteúdo**: reaproveitar `components/activities/BoardActivitiesModal/Item.jsx` para renderizar cada atividade.

## Ficheiros a criar

- `client/src/entry-actions/timeline-panel.js`
  - `toggleTimelinePanel()`
  - `setTimelinePanelOpen(isOpen)`

- `client/src/reducers/timelinePanelReducer.js`
  - Estado inicial: `{ isOpen: false }`
  - Trata `TIMELINE_PANEL_TOGGLE` e `TIMELINE_PANEL_SET_OPEN`

- `client/src/selectors/timelinePanelSelectors.js`
  - `export const selectIsTimelinePanelOpen = (state) => state.timelinePanel.isOpen;`

- `client/src/components/activities/BoardActivitiesPanel/BoardActivitiesPanel.jsx`
  - Painel lateral direito; integra `useInView` e lista `activityIds` do quadro
  - Header com botão fechar; corpo com `Comment.Group` e `<Item />`

- `client/src/components/activities/BoardActivitiesPanel/BoardActivitiesPanel.module.scss`
  - Estilos do drawer: posição fixa à direita, largura, transições `transform`, backdrop, z-index
  - Aplicar classes `glass-panel`/`glass-perfect-card` no container

- `client/src/components/activities/BoardActivitiesPanel/index.js`
  - `export { default } from './BoardActivitiesPanel';`

## Ficheiros a alterar

- `client/src/constants/ActionTypes.js`
  - Adicionar:
    - `TIMELINE_PANEL_TOGGLE`
    - `TIMELINE_PANEL_SET_OPEN`

- `client/src/reducers/index.js`
  - Importar e combinar `timelinePanel` no root reducer (`timelinePanel: timelinePanelReducer`)

- `client/src/entry-actions/index.js`
  - Importar `timeline-panel` e espalhar no export (como já é feito com `sidebar`)

- `client/src/components/common/Fixed/Fixed.jsx`
  - Importar e renderizar `<BoardActivitiesPanel />` abaixo de `<BoardActions />` (a nível de `Fixed`, para ficar sobre o conteúdo)

- `client/src/components/boards/BoardActions/RightSide/RightSide.jsx`
  - Adicionar um botão extra (ao lado do botão de ações) para `toggleTimelinePanel`
  - Ícone sugerido: `history` (Semantic UI)

- `client/src/components/boards/BoardActions/RightSide/ActionsStep.jsx` (fase 2)
  - Substituir a entrada "Histórico/Ações" para acionar o painel (em vez de abrir modal)
  - Depois, remover essa entrada se for redundante

- `client/src/components/boards/Board/Board.jsx` (fase 3)
  - Remover `BoardActivitiesModal` e o `case ModalTypes.BOARD_ACTIVITIES`

- `client/src/entry-actions/modals.js` (fase 3)
  - Remover `openBoardActivitiesModal`

- `client/src/constants/ModalTypes.js` (fase 3)
  - Remover `BOARD_ACTIVITIES`

- `client/src/styles/glass-theme.css` (opcional)
  - Adicionar utilitários `.glass-drawer`/`.glass-backdrop` (se preferir centralizar tokens do drawer). Caso contrário, manter estilos no módulo SCSS do painel.

## Detalhes de implementação

### Estado/ações

- `ActionTypes.js`
  - `TIMELINE_PANEL_TOGGLE: 'TIMELINE_PANEL_TOGGLE'`
  - `TIMELINE_PANEL_SET_OPEN: 'TIMELINE_PANEL_SET_OPEN'`

- `timelinePanelReducer.js`
  - `initialState = { isOpen: false }`
  - `TIMELINE_PANEL_TOGGLE`: alterna `isOpen`
  - `TIMELINE_PANEL_SET_OPEN`: define `isOpen` de forma explícita

- `entry-actions/timeline-panel.js`
  - `toggleTimelinePanel()` → `{ type: ActionTypes.Timeline_PANEL_TOGGLE }`
  - `setTimelinePanelOpen(isOpen)` → `{ type: ActionTypes.TIMELINE_PANEL_SET_OPEN, payload: { isOpen } }`

- `selectors/timelinePanelSelectors.js`
  - `selectIsTimelinePanelOpen(state)`

### Painel (drawer)

- `BoardActivitiesPanel.jsx`
  - Redux: `activityIds` do seletor `selectors.selectActivityIdsForCurrentBoard`
  - Estado do painel: `selectIsTimelinePanelOpen`
  - Fecho: `dispatch(setTimelinePanelOpen(false))` em:
    - clique no botão fechar
    - clique no backdrop
    - tecla `Esc` (registrar `useEffect` com `keydown`)
  - Conteúdo: copiar padrão do `BoardActivitiesModal`:
    - Lista com `<Item id={activityId} />`
    - `useInView` para `fetchActivitiesInCurrentBoard()` ao chegar ao sentinela
  - Estilos: container fixo à direita (`position: fixed; right: 0; top: 0; bottom: 0;`), largura 380–420px, `transform: translateX(100%)` quando fechado e `translateX(0)` quando aberto, transição suave. Backdrop semi-transparente.
  - Glass: aplicar `className` combinando o módulo (`.panel`) com `glass-panel` e/ou `glass-perfect-card`.

### Botão de abertura (RightSide)

- Em `RightSide.jsx`, ao lado do `ActionsPopup`, inserir um `<button>` com ícone `history` e `onClick={dispatch(toggleTimelinePanel())}`;
- Manter estilos consistentes com `styles.button` e `styles.action` existentes.

### Integração no layout

- Em `Fixed.jsx`, renderizar `<BoardActivitiesPanel />` para que o painel fique acima do conteúdo independente da view do quadro. Garantir `z-index` alto e que não interfira no `Header`.

## Passos incrementais (com testes manuais)

1) Infra de estado (Redux)
   - Criar `ActionTypes`, reducer, entry-actions e selectors do painel.
   - Integrar no `reducers/index.js` e `entry-actions/index.js`.
   - Teste manual: dispatch manual via DevTools (abrir/fechar) e verificar `state.timelinePanel.isOpen`.

2) Componente do painel (estrutura + estilos)
   - Criar `BoardActivitiesPanel` com container, backdrop e transições; sem conteúdo ainda.
   - Teste manual: alternar `isOpen` via botão temporário ou DevTools e validar animações, overlay e fechamento por clique/`Esc`.

3) Conteúdo da timeline
   - Reutilizar os itens do modal (`BoardActivitiesModal/Item.jsx`).
   - Implementar `useInView` e `fetchActivitiesInCurrentBoard()` como no modal.
   - Teste manual: abrir painel e rolar para carregar mais; validar itens e datas.

4) Botão no `RightSide`
   - Adicionar o botão com ícone `history` ao lado do botão de ações.
   - Teste manual: abrir/fechar o painel pelo botão; confirmar que o estado persiste ao mudar de vista do quadro.

5) Substituir entrada do menu de ações (opcional)
   - Em `ActionsStep.jsx`, substituir a opção de histórico para chamar `toggleTimelinePanel()`.
   - Teste manual: abrir pelo menu de ações.

6) Remoção do modal legado
   - Remover `BoardActivitiesModal` e referências:
     - `Board.jsx`: eliminar case `ModalTypes.BOARD_ACTIVITIES`
     - `ModalTypes.js`: remover `BOARD_ACTIVITIES`
     - `entry-actions/modals.js`: remover `openBoardActivitiesModal`
     - Apagar diretório `components/activities/BoardActivitiesModal/`
   - Teste manual: garantir que apenas o painel existe e funciona.

## Critérios de aceitação

- Botão de histórico presente à direita, junto do botão de ações do quadro.
- Painel abre/fecha com animação, tema vidro consistente, sem trepidações/layout shift.
- Lista de atividades é idêntica à do modal anterior (mesmos textos, traduções e ícones), com carregamento infinito.
- Fecho por botão, clique fora e tecla `Esc` funcionando.
- Modal antigo de histórico removido (fase final), sem referências.

## Riscos e mitigação

- Conflitos de z-index com modais/menus: validar com `Header`, `Popup` e `BoardActions`; ajustar `z-index` no SCSS.
- Performance em boards grandes: manter virtualização simples via `useInView` e carregamento paginado existente.
- Acessibilidade: garantir foco inicial e `aria` labels; validar navegação por teclado.

## Compatibilidades e riscos técnicos

### Sobreposição de camadas (z-index)
- **Risco**: O painel e backdrop podem ficar atrás/à frente de popups, modais ou do `Header`.
- **Mitigação**: z-index alto no painel e backdrop; manter estilos no módulo SCSS do painel para não afetar `.ui.modal.glass` e `glass-modal-override.css`.

### Conflito com popups/ações do quadro
- **Risco**: Abrir o painel enquanto o `ActionsPopup` está aberto pode causar sobreposição confusa.
- **Mitigação**: Fechar popups ativos ao abrir o painel; clique no backdrop fecha o painel.

### Rotas e estados persistidos
- **Risco**: Trocar de projeto/quadro com o painel aberto deixa o painel sem conteúdo válido.
- **Mitigação**: Fechar o painel em `LOCATION_CHANGE_HANDLE`; resetar ao mudar de board.

### Fetch duplicado de atividades
- **Risco**: Durante a fase de transição (enquanto o modal antigo ainda existe), abrir ambos pode disparar múltiplos `fetchActivitiesInCurrentBoard()`.
- **Mitigação**: Acionar `fetch` apenas quando o painel estiver visível; honrar `isActivitiesFetching` e `isAllActivitiesFetched` como no modal.

### Layout do `RightSide.jsx` (responsivo)
- **Risco**: Adicionar um novo botão pode quebrar alinhamento em telas estreitas.
- **Mitigação**: Reutilizar `styles.button`/`styles.action`; testar em breakpoints menores; aplicar `flex-wrap` se necessário no `RightSide.module.scss`.

### Tecla Esc e foco
- **Risco**: `Esc` do painel competir com `Esc` de modais/popups.
- **Mitigação**: Ao abrir o painel, focar o header do painel e tratar `Esc` localmente; parar propagação ao fechar.

### Acessibilidade
- **Risco**: Sem `aria-*` e foco inicial, navegação por teclado fica deficiente.
- **Mitigação**: `role="dialog"` no contêiner, `aria-modal="true"` no backdrop, foco no título ao abrir.

### Temas glass existentes
- **Risco**: Overrides de `glass-modal.css`/`glass-modal-override.css` afetarem o painel.
- **Mitigação**: Isolar estilos em `BoardActivitiesPanel.module.scss`; usar tokens/glass utilitários (`glass-panel`, `glass-perfect-card`) apenas como classes adicionais (não sobrescrever globais).

### Remoção do modal legado
- **Risco**: Referências residuais a `BOARD_ACTIVITIES` ou `openBoardActivitiesModal()` quebrarem navegação.
- **Mitigação**: Alterar `ActionsStep.jsx` para abrir o painel antes de remover o modal; depois remover `case` em `Board.jsx`, entrada em `ModalTypes.js` e action em `entry-actions/modals.js`. Já mapeado no plano.

### Desempenho em boards grandes
- **Risco**: Scroll + blur do glass degradar FPS em máquinas mais fracas.
- **Mitigação**: Manter blur moderado (já no tema), evitar sombras pesadas no painel, e carregar incrementalmente com `useInView`.

### Interação com a Sidebar esquerda
- **Risco**: Abrir/fechar a sidebar alterar layout enquanto o painel está aberto e causar "jump".
- **Mitigação**: O painel é `position: fixed`; não participa do fluxo — não deve mover. Apenas validar `z-index`.

## Checklists rápidos de implementação

- Estado:
  - [ ] Tipos em `ActionTypes`
  - [ ] Reducer `timelinePanelReducer`
  - [ ] Selectors `timelinePanelSelectors`
  - [ ] Entry-actions `timeline-panel`
  - [ ] Integrar em `reducers/index.js` e `entry-actions/index.js`

- UI:
  - [ ] `BoardActivitiesPanel.jsx` + `.module.scss`
  - [ ] Montar em `Fixed.jsx`
  - [ ] Botão em `RightSide.jsx`
  - [ ] Integração `useInView` + `entryActions.fetchActivitiesInCurrentBoard()`

- Limpeza final:
  - [ ] Remover modal e referências
  - [ ] Conferir traduções e strings
  - [ ] Smoke test geral (abrir/fechar, scroll, mudanças de vista/contexto)

## Referências internas úteis

- Tema vidro: `client/src/styles/glass-theme.css`
- Modal legado: `client/src/components/activities/BoardActivitiesModal/*`
- Botões à direita do quadro: `client/src/components/boards/BoardActions/RightSide/RightSide.jsx`
- Lista de ações do menu: `client/src/components/boards/BoardActions/RightSide/ActionsStep.jsx`
- Saga/serviço de atividades: `client/src/sagas/core/services/activities.js`
- Selectors: `client/src/selectors/activities.js`


