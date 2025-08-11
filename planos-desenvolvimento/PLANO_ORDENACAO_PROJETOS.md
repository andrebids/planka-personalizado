# Plano de Implementação - Ordenação Personalizada de Projetos

## 📋 Objetivo
Implementar funcionalidade para que cada usuário possa ordenar os projetos no menu lateral como desejar, com persistência da ordenação personalizada.

## 🎯 Funcionalidades a Implementar
- Ordenação personalizada por drag & drop
- Persistência da ordenação no localStorage
- Ordenação padrão (alfabética) como fallback
- Interface intuitiva para reordenar
- Manter todas as funcionalidades atuais

## 📊 Análise da Estrutura Atual

### Arquivos Principais Identificados:
- `src/components/common/Sidebar/ProjectList.jsx` - Lista de projetos
- `src/components/common/Sidebar/ProjectItem.jsx` - Item individual
- `src/selectors/sidebarSelectors.js` - Selectors dos projetos
- `src/reducers/sidebarReducer.js` - Estado do sidebar
- `src/constants/ActionTypes.js` - Tipos de actions

### Estado Atual:
- Projetos são ordenados alfabeticamente por padrão
- Não há persistência de ordenação personalizada
- Interface simples sem drag & drop

## 🚀 Fases de Implementação

### Fase 1: Estrutura de Estado e Persistência
**Objetivo**: Criar estrutura para armazenar ordenação personalizada

**Arquivos a Modificar/Criar**:

#### 1.1. Atualizar ActionTypes
**Arquivo**: `src/constants/ActionTypes.js`
```javascript
// Adicionar novas actions
PROJECTS_ORDER_SAVE: 'PROJECTS_ORDER_SAVE',
PROJECTS_ORDER_LOAD: 'PROJECTS_ORDER_LOAD',
PROJECTS_ORDER_RESET: 'PROJECTS_ORDER_RESET',
```

#### 1.2. Atualizar Sidebar Reducer
**Arquivo**: `src/reducers/sidebarReducer.js`
```javascript
const initialState = {
  isExpanded: false,
  // Nova propriedade para ordenação
  projectsOrder: null, // null = ordenação padrão, array = ordenação personalizada
};
```

#### 1.3. Criar Actions do Sidebar
**Arquivo**: `src/actions/sidebarActions.js` (novo arquivo)
```javascript
import ActionTypes from '../constants/ActionTypes';

export const saveProjectsOrder = (order) => ({
  type: ActionTypes.PROJECTS_ORDER_SAVE,
  payload: { order },
});

export const loadProjectsOrder = () => ({
  type: ActionTypes.PROJECTS_ORDER_LOAD,
});

export const resetProjectsOrder = () => ({
  type: ActionTypes.PROJECTS_ORDER_RESET,
});
```

#### 1.4. Atualizar Selectors
**Arquivo**: `src/selectors/sidebarSelectors.js`
```javascript
// Adicionar selector para ordenação
export const selectProjectsOrder = (state) => selectSidebarState(state).projectsOrder;

// Modificar selectSidebarProjects para aplicar ordenação
export const selectSidebarProjects = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  (state) => selectProjectsOrder(state),
  ({ User, Board }, userId, customOrder) => {
    // ... lógica existente ...
    
    // Aplicar ordenação personalizada se existir
    if (customOrder && customOrder.length > 0) {
      const orderMap = {};
      customOrder.forEach((projectId, index) => {
        orderMap[projectId] = index;
      });
      
      return projectModels
        .slice(0, 50)
        .map((projectModel) => {
          // ... lógica existente ...
        })
        .sort((a, b) => {
          const orderA = orderMap[a.id] !== undefined ? orderMap[a.id] : 999;
          const orderB = orderMap[b.id] !== undefined ? orderMap[b.id] : 999;
          return orderA - orderB;
        });
    }
    
    // Ordenação alfabética padrão
    return projectModels
      .slice(0, 50)
      .map((projectModel) => {
        // ... lógica existente ...
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  },
);
```

### Fase 2: Interface de Drag & Drop
**Objetivo**: Implementar interface para reordenar projetos

#### 2.1. Instalar Dependência
```bash
npm install react-beautiful-dnd
```

#### 2.2. Criar Componente de Ordenação
**Arquivo**: `src/components/common/Sidebar/ProjectOrderControls.jsx` (novo)
```javascript
import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { resetProjectsOrder } from '../../../actions/sidebarActions';
import { selectProjectsOrder } from '../../../selectors/sidebarSelectors';

import styles from './ProjectOrderControls.module.scss';

const ProjectOrderControls = React.memo(() => {
  const dispatch = useDispatch();
  const customOrder = useSelector(selectProjectsOrder);

  const handleResetOrder = () => {
    dispatch(resetProjectsOrder());
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <button
          className={styles.resetButton}
          onClick={handleResetOrder}
          type="button"
          title="Restaurar ordenação padrão"
        >
          <i className="fas fa-sort-alpha-down" />
        </button>
      </div>
    </div>
  );
});

export default ProjectOrderControls;
```

#### 2.3. Estilos para Controles
**Arquivo**: `src/components/common/Sidebar/ProjectOrderControls.module.scss` (novo)
```scss
.wrapper {
  margin-bottom: 8px;
}

.controls {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.resetButton {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
    color: #495057;
  }
}
```

#### 2.4. Atualizar ProjectList com Drag & Drop
**Arquivo**: `src/components/common/Sidebar/ProjectList.jsx`
```javascript
import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useDispatch, useSelector } from 'react-redux';

import ProjectItem from './ProjectItem';
import ProjectOrderControls from './ProjectOrderControls';
import { selectSidebarProjects, selectTotalProjectsCount } from '../../../selectors/sidebarSelectors';
import { saveProjectsOrder } from '../../../actions/sidebarActions';

import styles from './ProjectList.module.scss';

const ProjectList = React.memo(() => {
  const dispatch = useDispatch();
  const projects = useSelector(selectSidebarProjects);
  const totalProjectsCount = useSelector(selectTotalProjectsCount);
  const [showAll, setShowAll] = useState(false);

  const displayedProjects = useMemo(() => {
    if (showAll) {
      return projects;
    }
    return projects.slice(0, 20);
  }, [projects, showAll]);

  const handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(displayedProjects);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const newOrder = items.map(item => item.id);
    dispatch(saveProjectsOrder(newOrder));
  };

  const hasMoreProjects = totalProjectsCount > displayedProjects.length;

  if (projects.length === 0) {
    return (
      <div className={styles.wrapper}>
        <h3 className={styles.title}>MEUS PROJETOS</h3>
        <div className={styles.empty}>
          <p>Nenhum projeto encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>MEUS PROJETOS</h3>
      <ProjectOrderControls />
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="projects">
          {(provided) => (
            <div
              className={styles.list}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {displayedProjects.map((project, index) => (
                <Draggable
                  key={project.id}
                  draggableId={project.id.toString()}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`${styles.draggableItem} ${
                        snapshot.isDragging ? styles.dragging : ''
                      }`}
                    >
                      <ProjectItem project={project} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      {hasMoreProjects && (
        <div className={styles.moreProjects}>
          <button
            className={styles.moreButton}
            onClick={() => setShowAll(!showAll)}
            type="button"
          >
            {showAll ? 'Mostrar menos' : `Mostrar mais ${totalProjectsCount - displayedProjects.length} projetos`}
          </button>
        </div>
      )}
    </div>
  );
});

export default ProjectList;
```

#### 2.5. Atualizar Estilos do ProjectList
**Arquivo**: `src/components/common/Sidebar/ProjectList.module.scss`
```scss
// ... estilos existentes ...

.draggableItem {
  transition: transform 0.2s ease;
  
  &.dragging {
    transform: rotate(2deg);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}

.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 50px; // Para droppable area
}
```

### Fase 3: Persistência no localStorage
**Objetivo**: Salvar e carregar ordenação automaticamente

#### 3.1. Criar Middleware de Persistência
**Arquivo**: `src/middleware/projectOrderMiddleware.js` (novo)
```javascript
import ActionTypes from '../constants/ActionTypes';

const STORAGE_KEY = 'planka_projects_order';

export const projectOrderMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  switch (action.type) {
    case ActionTypes.PROJECTS_ORDER_SAVE:
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload.order));
      } catch (error) {
        console.warn('Erro ao salvar ordenação:', error);
      }
      break;
      
    case ActionTypes.PROJECTS_ORDER_RESET:
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.warn('Erro ao remover ordenação:', error);
      }
      break;
      
    default:
      break;
  }
  
  return result;
};
```

#### 3.2. Atualizar Store
**Arquivo**: `src/store.js`
```javascript
import { createStore, applyMiddleware, compose } from 'redux';
import { createEpicMiddleware } from 'redux-observable';

import rootReducer from './reducers';
import rootEpic from './sagas';
import { projectOrderMiddleware } from './middleware/projectOrderMiddleware';

// ... código existente ...

const epicMiddleware = createEpicMiddleware();

const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(epicMiddleware, projectOrderMiddleware),
    // ... outras configurações ...
  ),
);

// ... resto do código ...
```

#### 3.3. Carregar Ordenação na Inicialização
**Arquivo**: `src/components/common/Sidebar/ProjectList.jsx`
```javascript
import React, { useState, useMemo, useEffect } from 'react';
// ... outros imports ...

const ProjectList = React.memo(() => {
  const dispatch = useDispatch();
  // ... código existente ...

  // Carregar ordenação na inicialização
  useEffect(() => {
    const savedOrder = localStorage.getItem('planka_projects_order');
    if (savedOrder) {
      try {
        const order = JSON.parse(savedOrder);
        dispatch({ type: ActionTypes.PROJECTS_ORDER_LOAD, payload: { order } });
      } catch (error) {
        console.warn('Erro ao carregar ordenação:', error);
        localStorage.removeItem('planka_projects_order');
      }
    }
  }, [dispatch]);

  // ... resto do código ...
});
```

### Fase 4: Melhorias de UX
**Objetivo**: Adicionar feedback visual e melhorar experiência

#### 4.1. Atualizar ProjectItem com Indicadores de Drag
**Arquivo**: `src/components/common/Sidebar/ProjectItem.jsx`
```javascript
// Adicionar indicador visual de que o item é arrastável
const ProjectItem = React.memo(({ project }) => {
  // ... código existente ...

  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.hasNotifications]: project.hasNotifications,
        [styles.draggable]: true, // Indicar que é arrastável
      })}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <div className={styles.content}>
        <div className={styles.dragHandle}>
          <i className="fas fa-grip-vertical" />
        </div>
        <span className={styles.name}>{project.name}</span>
        {project.hasNotifications && (
          <NotificationIndicator />
        )}
      </div>
    </div>
  );
});
```

#### 4.2. Estilos para Drag Handle
**Arquivo**: `src/components/common/Sidebar/ProjectItem.module.scss`
```scss
// ... estilos existentes ...

.draggable {
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
}

.dragHandle {
  color: #adb5bd;
  margin-right: 8px;
  opacity: 0.6;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
}

.content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
```

### Fase 5: Tratamento de Erros e Fallbacks
**Objetivo**: Garantir robustez da funcionalidade

#### 5.1. Validação de Ordenação
**Arquivo**: `src/selectors/sidebarSelectors.js`
```javascript
// Função auxiliar para validar ordenação
const validateProjectOrder = (order, projectIds) => {
  if (!Array.isArray(order)) return null;
  
  // Verificar se todos os IDs na ordenação existem nos projetos
  const validOrder = order.filter(id => projectIds.includes(id));
  
  // Adicionar projetos que não estão na ordenação
  const missingProjects = projectIds.filter(id => !validOrder.includes(id));
  
  return [...validOrder, ...missingProjects];
};

export const selectSidebarProjects = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  (state) => selectProjectsOrder(state),
  ({ User, Board }, userId, customOrder) => {
    // ... lógica existente ...
    
    const projectModels = userModel.getProjectsModelArray();
    const projectIds = projectModels.map(pm => pm.id);
    
    // Validar ordenação personalizada
    const validOrder = customOrder ? validateProjectOrder(customOrder, projectIds) : null;
    
    if (validOrder && validOrder.length > 0) {
      const orderMap = {};
      validOrder.forEach((projectId, index) => {
        orderMap[projectId] = index;
      });
      
      return projectModels
        .slice(0, 50)
        .map((projectModel) => {
          // ... lógica existente ...
        })
        .sort((a, b) => {
          const orderA = orderMap[a.id] !== undefined ? orderMap[a.id] : 999;
          const orderB = orderMap[b.id] !== undefined ? orderMap[b.id] : 999;
          return orderA - orderB;
        });
    }
    
    // Ordenação alfabética padrão
    return projectModels
      .slice(0, 50)
      .map((projectModel) => {
        // ... lógica existente ...
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  },
);
```

## 📁 Estrutura Final de Arquivos

```
src/
├── components/
│   └── common/
│       └── Sidebar/
│           ├── ProjectList.jsx (modificado)
│           ├── ProjectList.module.scss (modificado)
│           ├── ProjectItem.jsx (modificado)
│           ├── ProjectItem.module.scss (modificado)
│           ├── ProjectOrderControls.jsx (novo)
│           └── ProjectOrderControls.module.scss (novo)
├── actions/
│   └── sidebarActions.js (novo)
├── selectors/
│   └── sidebarSelectors.js (modificado)
├── reducers/
│   └── sidebarReducer.js (modificado)
├── middleware/
│   └── projectOrderMiddleware.js (novo)
├── constants/
│   └── ActionTypes.js (modificado)
└── store.js (modificado)
```

## 🛡️ Considerações de Segurança

1. **Validação de Dados**: Validar ordenação antes de aplicar
2. **Fallback Seguro**: Sempre ter ordenação alfabética como fallback
3. **Tratamento de Erros**: Capturar erros de localStorage
4. **Performance**: Limitar número de projetos ordenados
5. **Compatibilidade**: Manter funcionalidades existentes

## 🎯 Critérios de Sucesso

- [ ] Usuários podem reordenar projetos por drag & drop
- [ ] Ordenação é persistida no localStorage
- [ ] Ordenação é carregada automaticamente
- [ ] Botão para restaurar ordenação padrão funciona
- [ ] Interface é intuitiva e responsiva
- [ ] Todas as funcionalidades existentes são mantidas
- [ ] Performance não é afetada
- [ ] Tratamento de erros robusto

## 🚀 Próximos Passos

1. **Implementar Fase 1**: Estrutura de estado e persistência
2. **Testar cada fase** individualmente
3. **Validar funcionalidade** após cada implementação
4. **Documentar mudanças** realizadas
5. **Testar em diferentes navegadores**

## 📝 Notas Importantes

- **Backup obrigatório** antes de cada modificação
- **Testar incrementalmente** cada funcionalidade
- **Manter padrões** do projeto existente
- **Documentar mudanças** para futuras manutenções
- **Considerar performance** com muitos projetos
