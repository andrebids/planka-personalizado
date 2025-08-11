# Plano de Implementação - Favoritos na Barra Lateral

## Visão Geral
Implementar funcionalidade de favoritos na barra lateral que permite:
- Marcar projetos como favoritos
- Mostrar favoritos no topo da lista com estrela cheia
- Ordenar favoritos com drag and drop
- Persistir ordem dos favoritos

## Análise do Sistema Atual

### ✅ Funcionalidades Existentes
- Sistema de favoritos já implementado no backend
- Selector `selectFavoriteProjectIdsForCurrentUser` disponível
- Action `updateProject` com `isFavorite` já existe
- Componente `ProjectCard` já tem botão de favorito
- Drag and drop já implementado na `ProjectList`

### 🔧 Funcionalidades a Implementar
- Botão de favorito no `ProjectItem` da sidebar
- Separação visual entre favoritos e projetos normais
- Ordenação independente para favoritos
- Persistência da ordem dos favoritos

---

## Fase 1: Estrutura Base dos Favoritos

### 1.1 Modificar ProjectItem
**Arquivo**: `client/src/components/common/Sidebar/ProjectItem.jsx`

**Mudanças**:
- Adicionar botão de estrela (favorito) no canto direito
- Mostrar estrela cheia para favoritos, vazia para não-favoritos
- Prevenir propagação do clique no botão de favorito
- Adicionar tooltip "Adicionar aos favoritos" / "Remover dos favoritos"

**Código**:
```jsx
// Adicionar no ProjectItem
const handleFavoriteClick = (e) => {
  e.stopPropagation(); // Prevenir navegação
  dispatch(
    entryActions.updateProject(project.id, {
      isFavorite: !project.isFavorite,
    }),
  );
};

// No JSX, adicionar botão de favorito
<div className={styles.favoriteButton} onClick={handleFavoriteClick}>
  <i className={`fas fa-star ${project.isFavorite ? styles.filled : styles.outline}`} />
</div>
```

### 1.2 Atualizar CSS do ProjectItem
**Arquivo**: `client/src/components/common/Sidebar/ProjectItem.module.scss`

**Mudanças**:
- Adicionar estilos para botão de favorito
- Posicionar no canto direito
- Estilos para estrela cheia/vazia
- Hover effects

### 1.3 Modificar ProjectList para Separar Favoritos
**Arquivo**: `client/src/components/common/Sidebar/ProjectList.jsx`

**Mudanças**:
- Separar projetos em favoritos e não-favoritos
- Mostrar favoritos primeiro
- Adicionar separador visual entre seções
- Manter drag and drop funcionando para cada seção

---

## Fase 2: Drag and Drop para Favoritos

### 2.1 Criar Componente FavoriteProjectList
**Arquivo**: `client/src/components/common/Sidebar/FavoriteProjectList.jsx`

**Funcionalidades**:
- Lista separada para projetos favoritos
- Drag and drop independente
- Persistência da ordem dos favoritos
- Indicador visual de que são favoritos

### 2.2 Criar Selector para Favoritos Ordenados
**Arquivo**: `client/src/selectors/sidebarSelectors.js`

**Novo Selector**:
```javascript
export const selectFavoriteProjectsOrdered = createSelector(
  selectSidebarProjects,
  (state) => state.sidebar.favoritesOrder,
  (projects, favoritesOrder) => {
    const favorites = projects.filter(p => p.isFavorite);
    
    if (!favoritesOrder || favoritesOrder.length === 0) {
      return favorites;
    }
    
    // Ordenar baseado na ordem salva
    return favoritesOrder
      .map(id => favorites.find(p => p.id === id))
      .filter(Boolean);
  }
);
```

### 2.3 Criar Actions para Ordenação de Favoritos
**Arquivo**: `client/src/actions/sidebarActions.js`

**Novas Actions**:
```javascript
export const saveFavoritesOrder = (order) => ({
  type: ActionTypes.SIDEBAR_FAVORITES_ORDER_SAVE,
  payload: order,
});

export const loadFavoritesOrder = (order) => ({
  type: ActionTypes.SIDEBAR_FAVORITES_ORDER_LOAD,
  payload: order,
});
```

### 2.4 Atualizar Reducer da Sidebar
**Arquivo**: `client/src/reducers/sidebarReducer.js`

**Novo Estado**:
```javascript
const initialState = {
  // ... estado existente
  favoritesOrder: [],
};
```

---

## Fase 3: Persistência da Ordem

### 3.1 Implementar Persistência no localStorage
**Arquivo**: `client/src/components/common/Sidebar/ProjectList.jsx`

**Funcionalidades**:
- Salvar ordem dos favoritos no localStorage
- Carregar ordem na inicialização
- Sincronizar com mudanças de favoritos

**Código**:
```javascript
// Salvar ordem
const saveFavoritesOrderToStorage = (order) => {
  localStorage.setItem('planka_favorites_order', JSON.stringify(order));
};

// Carregar ordem
const loadFavoritesOrderFromStorage = () => {
  const saved = localStorage.getItem('planka_favorites_order');
  return saved ? JSON.parse(saved) : [];
};
```

### 3.2 Middleware de Persistência
**Arquivo**: `client/src/middleware/sidebarMiddleware.js`

**Funcionalidades**:
- Interceptar mudanças na ordem dos favoritos
- Salvar automaticamente no localStorage
- Tratar erros de localStorage

---

## Fase 4: Interface Visual

### 4.1 Separador Visual
**Arquivo**: `client/src/components/common/Sidebar/ProjectList.module.scss`

**Estilos**:
- Linha separadora entre favoritos e projetos normais
- Título "FAVORITOS" para seção de favoritos
- Espaçamento adequado entre seções

### 4.2 Indicadores Visuais
**Arquivo**: `client/src/components/common/Sidebar/ProjectItem.module.scss`

**Estilos**:
- Estrela cheia para favoritos
- Estrela vazia para não-favoritos
- Hover effects
- Transições suaves

### 4.3 Responsividade
- Garantir que funciona bem em mobile
- Ajustar tamanhos dos botões
- Manter usabilidade em telas pequenas

---

## Fase 5: Integração e Testes

### 5.1 Integrar com Sistema Existente
- Conectar com `selectFavoriteProjectIdsForCurrentUser`
- Usar `updateProject` action existente
- Manter compatibilidade com `Favorites` component

### 5.2 Testes Manuais
- [ ] Marcar projeto como favorito
- [ ] Desmarcar projeto como favorito
- [ ] Verificar aparecimento no topo da lista
- [ ] Testar drag and drop de favoritos
- [ ] Verificar persistência da ordem
- [ ] Testar em diferentes dispositivos

### 5.3 Validação
- [ ] Não quebrar funcionalidades existentes
- [ ] Performance adequada
- [ ] UX consistente
- [ ] Acessibilidade mantida

---

## Estrutura de Arquivos

### Arquivos a Modificar
```
client/src/components/common/Sidebar/
├── ProjectItem.jsx ✅ (adicionar botão favorito)
├── ProjectItem.module.scss ✅ (estilos do botão)
├── ProjectList.jsx ✅ (separar favoritos)
├── ProjectList.module.scss ✅ (estilos do separador)
└── FavoriteProjectList.jsx 🆕 (nova lista de favoritos)
```

### Arquivos a Criar
```
client/src/
├── actions/sidebarActions.js ✅ (actions de favoritos)
├── reducers/sidebarReducer.js ✅ (reducer de favoritos)
├── selectors/sidebarSelectors.js ✅ (selector de favoritos)
└── middleware/sidebarMiddleware.js 🆕 (persistência)
```

---

## Cronograma de Implementação

### Semana 1: Estrutura Base
- [ ] Modificar ProjectItem com botão de favorito
- [ ] Atualizar estilos CSS
- [ ] Testar funcionalidade básica

### Semana 2: Separação e Ordenação
- [ ] Separar favoritos na ProjectList
- [ ] Implementar drag and drop para favoritos
- [ ] Criar selectors e actions

### Semana 3: Persistência
- [ ] Implementar persistência no localStorage
- [ ] Criar middleware
- [ ] Testar persistência

### Semana 4: Polimento e Testes
- [ ] Melhorar interface visual
- [ ] Testes manuais completos
- [ ] Ajustes finais

---

## Considerações Técnicas

### Performance
- Usar `React.memo` para componentes
- Implementar `useMemo` para cálculos pesados
- Lazy loading se necessário

### Compatibilidade
- Manter compatibilidade com sistema existente
- Não quebrar funcionalidades atuais
- Seguir padrões do projeto

### Acessibilidade
- Adicionar `aria-label` nos botões
- Suporte a navegação por teclado
- Tooltips informativos

---

## Próximos Passos

1. **Implementar Fase 1**: Adicionar botão de favorito no ProjectItem
2. **Testar funcionalidade básica**: Marcar/desmarcar favoritos
3. **Implementar Fase 2**: Separar favoritos na lista
4. **Implementar Fase 3**: Drag and drop para favoritos
5. **Implementar Fase 4**: Persistência da ordem
6. **Testes finais**: Validação completa

---

## Notas Importantes

- O sistema de favoritos já existe no backend
- Usar as actions e selectors existentes quando possível
- Manter consistência com o design atual
- Testar em diferentes cenários de uso
- Documentar mudanças para futuras manutenções
