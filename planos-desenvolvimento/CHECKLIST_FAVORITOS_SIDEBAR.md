# Checklist de Implementação - Favoritos na Barra Lateral

## Status Geral
- [ ] **Fase 1**: Estrutura Base ⏳
- [ ] **Fase 2**: Drag and Drop ⏳
- [ ] **Fase 3**: Persistência ⏳
- [ ] **Fase 4**: Interface Visual ⏳
- [ ] **Fase 5**: Integração e Testes ⏳

---

## Fase 1: Estrutura Base dos Favoritos

### ⏳ Preparação
- [x] Criar plano detalhado
- [x] Criar checklist de acompanhamento
- [x] Analisar sistema existente de favoritos
- [x] Identificar arquivos a modificar

### ⏳ Implementação
- [ ] Modificar `ProjectItem.jsx` para adicionar botão de favorito (mesma lógica do `ProjectCard`)
- [ ] Adicionar `handleFavoriteClick` com `stopPropagation`
- [ ] Reutilizar `entryActions.updateProject(id, { isFavorite: !project.isFavorite })`
- [ ] Atualizar `ProjectItem.module.scss` com estilos do botão (estrela cheia/vazia + hover)
- [ ] Atualizar `sidebarSelectors.js` para expor `selectSidebarFavoriteProjects` e `selectSidebarOtherProjects` (filtrar `project.isHidden`)
- [ ] Modificar `ProjectList.jsx` para renderizar duas seções: FAVORITOS e MEUS PROJETOS (não duplicar o componente `Favorites` do topo)
- [ ] Implementar lógica de separação baseada em `project.isFavorite` (alinhado ao selector `selectFavoriteProjectIdsForCurrentUser`)
- [ ] Adicionar separador visual entre seções
- [ ] Acessibilidade básica do botão: `tabIndex=0`, `aria-pressed`, `title`; suportar `Enter`/`Espaço` no `onKeyDown`

### ⏳ Testes
- [ ] Teste de clique no botão de favorito
- [ ] Teste de prevenção de navegação
- [ ] Teste de toggle de favorito (sincroniza com barra de favoritos do topo)
- [ ] Teste de ocultos: `isHidden` não aparece nem em favoritos nem no restante
- [ ] Teste de separação visual
- [ ] Teste de responsividade

---

## Fase 2: Drag and Drop para Favoritos

### ⏳ Preparação
- [ ] Analisar implementação atual de drag and drop
- [ ] Definir estrutura de dados para ordem dos favoritos
- [ ] Planejar integração com Redux

### ⏳ Implementação
- [ ] Criar `FavoriteProjectList.jsx`
- [ ] Implementar drag and drop independente para favoritos (Droppable separado)
- [ ] Criar selectors `selectSidebarFavoriteProjectsOrdered` e `selectSidebarOtherProjectsOrdered`
- [ ] Criar actions `FAVORITES_ORDER_SAVE`, `FAVORITES_ORDER_LOAD` e `FAVORITES_ORDER_RESET` em `ActionTypes.js`
- [ ] Atualizar `sidebarActions.js` com `saveFavoritesOrder`, `loadFavoritesOrder`, `resetFavoritesOrder`
- [ ] Atualizar `sidebarReducer.js` com novo estado `favoritesOrder`
- [ ] Integrar com `ProjectList.jsx` (dois Droppables: favoritos e não-favoritos)
- [ ] Implementar lógica de ordenação: usar `favoritesOrder` para favoritos e `projectsOrder` para os demais

### ⏳ Testes
- [ ] Teste de drag and drop de favoritos
- [ ] Teste de ordenação independente
- [ ] Teste de integração com Redux
- [ ] Teste de performance

---

## Fase 3: Persistência da Ordem

### ⏳ Preparação
- [ ] Analisar padrões de localStorage do projeto
- [ ] Definir estrutura de dados persistidos
- [ ] Planejar sincronização

### ⏳ Implementação
- [ ] Implementar `saveFavoritesOrderToStorage` com chave `planka_favorites_order`
- [ ] Implementar `loadFavoritesOrderFromStorage` com chave `planka_favorites_order`
- [ ] (Opcional) Criar `sidebarMiddleware.js` para persistir automaticamente `projectsOrder` e `favoritesOrder`
- [ ] Conectar middleware (se criado) com Redux
- [ ] Implementar carregamento inicial em `ProjectList.jsx` e `FavoriteProjectList.jsx`
- [ ] Implementar salvamento automático
- [ ] Tratar erros de localStorage

### ⏳ Testes
- [ ] Teste de persistência entre sessões
- [ ] Teste de carregamento inicial
- [ ] Teste de salvamento automático
- [ ] Teste de tratamento de erros

---

## Fase 4: Interface Visual

### ⏳ Preparação
- [ ] Definir design do separador visual
- [ ] Planejar indicadores visuais
- [ ] Considerar responsividade

### ⏳ Implementação
- [ ] Adicionar separador visual em `ProjectList.module.scss`
- [ ] Implementar título "FAVORITOS"
- [ ] Melhorar estilos do botão de favorito
- [ ] Adicionar transições suaves
- [ ] Implementar responsividade
- [ ] Adicionar tooltips informativos
- [ ] Melhorar acessibilidade
- [ ] Posicionar a estrela à direita do nome do projeto (usar `margin-left: auto` no container)
- [ ] Exibição: favorito sempre visível; não favorito só aparece no hover do item
- [ ] Tamanhos: botão 28–32px (36px em mobile), ícone 18px
- [ ] Cores: favorito #F6C85C; hover com `rgba(0,0,0,0.12)`; ícone branco 80% quando não favorito
- [ ] Animações: transições de opacidade/transform 0.2–0.25s; leve `scale(1.05)` no hover
- [ ] Acessibilidade visual: foco visível (outline/box-shadow), `aria-pressed` correto
- [ ] Consistência com `ProjectCard.module.scss` (`favoriteButton`, `favoriteButtonAppearable`, `favoriteButtonIcon`)

### ⏳ Testes
- [ ] Teste de aparência visual
- [ ] Teste de responsividade
- [ ] Teste de acessibilidade
- [ ] Teste de usabilidade
- [ ] Hover: estrela aparece apenas para não favoritos
- [ ] Favoritos: estrela sempre visível
- [ ] Teclado: Tab foca estrela; Enter/Espaço alternam favorito
- [ ] Tooltip: título correto ao alternar
- [ ] Mobile: área de toque confortável (não conflitar com notificações)
- [ ] Clique na estrela não navega para o projeto

---

## Fase 5: Integração e Testes

### ⏳ Preparação
- [ ] Verificar compatibilidade com sistema existente
- [ ] Planejar testes manuais
- [ ] Definir critérios de validação

### ⏳ Implementação
- [ ] Integrar com `selectFavoriteProjectIdsForCurrentUser` (fonte única da verdade para favoritos)
- [ ] Garantir que o `Favorites` (barra superior) continue inalterado e sincronizado
- [ ] Não duplicar estado: não criar flags locais alternativas a `project.isFavorite`
- [ ] Otimizar performance
- [ ] Implementar memoização
- [ ] Adicionar logging para debug

### ⏳ Testes
- [ ] Teste de integração com sistema existente
- [ ] Teste de compatibilidade
- [ ] Teste de performance
- [ ] Teste de diferentes cenários
- [ ] Teste final completo

---

## Validação Final

### ⏳ Funcionalidades
- [ ] Botão de favorito funciona corretamente
- [ ] Favoritos aparecem no topo da lista
- [ ] Drag and drop funciona para favoritos
- [ ] Ordem dos favoritos persiste
- [ ] Separação visual está clara
- [ ] Performance é adequada

### ⏳ Integração
- [ ] Não afeta funcionalidades existentes
- [ ] Segue padrões do projeto
- [ ] É responsivo
- [ ] É acessível

### ⏳ Qualidade
- [ ] Código está limpo
- [ ] Testes passam
- [ ] Documentação está completa
- [ ] Performance é boa

---

## Notas de Progresso

### Data: __/__/____
**Fase Atual**: Fase 1
**Status**: Em andamento
**Próximos Passos**: 
- Implementar botão de favorito no ProjectItem
- Testar funcionalidade básica

### Problemas Encontrados:
- 

### Soluções Implementadas:
- 

### Observações:
- 

---

## Arquivos Modificados

### Fase 1
- [ ] `client/src/components/common/Sidebar/ProjectItem.jsx`
- [ ] `client/src/components/common/Sidebar/ProjectItem.module.scss`
- [ ] `client/src/components/common/Sidebar/ProjectList.jsx`
- [ ] `client/src/selectors/sidebarSelectors.js`

### Fase 2
- [ ] `client/src/components/common/Sidebar/FavoriteProjectList.jsx` (novo)
- [ ] `client/src/selectors/sidebarSelectors.js`
- [ ] `client/src/actions/sidebarActions.js`
- [ ] `client/src/reducers/sidebarReducer.js`
- [ ] `client/src/constants/ActionTypes.js`

### Fase 3
- [ ] `client/src/middleware/sidebarMiddleware.js` (opcional)
- [ ] `client/src/components/common/Sidebar/ProjectList.jsx`

### Fase 4
- [ ] `client/src/components/common/Sidebar/ProjectList.module.scss`
- [ ] `client/src/components/common/Sidebar/ProjectItem.module.scss`

### Fase 5
- [ ] Todos os arquivos acima
- [ ] Otimizações e ajustes finais

---

## Comandos de Teste

### Teste de Funcionalidade Básica
```bash
# Iniciar aplicação
npm start

# Testar:
# 1. Clicar no botão de estrela em um projeto
# 2. Verificar se aparece no topo da lista
# 3. Verificar se a estrela fica cheia
```

### Teste de Drag and Drop
```bash
# Testar:
# 1. Arrastar um favorito para nova posição
# 2. Verificar se a ordem é mantida
# 3. Recarregar página e verificar persistência
```

### Teste de Persistência
```bash
# Testar:
# 1. Reordenar favoritos
# 2. Fechar e abrir navegador
# 3. Verificar se a ordem foi mantida
```

---

## Critérios de Aceitação

### ✅ Funcionalidade Completa
- [ ] Usuário pode marcar projetos como favoritos
- [ ] Favoritos aparecem no topo da lista da barra lateral (sem conflitar com a barra superior existente)
- [ ] Estrela cheia indica favorito (consistência com `ProjectCard`)
- [ ] Drag and drop funciona para favoritos (independente do restante)
- [ ] Ordem dos favoritos persiste em `localStorage` (chave `planka_favorites_order`)

### ✅ UX/UI
- [ ] Interface é intuitiva
- [ ] Feedback visual é claro
- [ ] Responsivo em diferentes dispositivos
- [ ] Acessível para usuários com deficiências

### ✅ Performance
- [ ] Carregamento rápido
- [ ] Drag and drop suave
- [ ] Sem travamentos
- [ ] Uso eficiente de memória

### ✅ Integração
- [ ] Compatível com sistema existente (`selectFavoriteProjectIdsForCurrentUser`, `entryActions.updateProject`)
- [ ] Não quebra funcionalidades atuais (Header/Favorites/ProjectCard)
- [ ] `isHidden` remove projetos tanto da lista quanto dos favoritos
- [ ] Segue padrões do projeto
- [ ] Código bem documentado
