/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';
import { selectCurrentUserId } from './users';

export const selectSidebarState = (state) => state.sidebar;
export const selectIsSidebarExpanded = (state) => selectSidebarState(state).isExpanded;
export const selectProjectsOrder = (state) => selectSidebarState(state).projectsOrder;

// Selector para projetos do sidebar com informações de notificações (otimizado)
export const selectSidebarProjects = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  (state) => selectProjectsOrder(state),
  ({ User, Board }, userId, customOrder) => {
    if (!userId) {
      return [];
    }

    const userModel = User.withId(userId);
    if (!userModel) {
      return [];
    }

    // Verificar se o modelo do usuário tem os métodos necessários
    if (!userModel.getProjectsModelArray || !userModel.getUnreadNotificationsQuerySet) {
      return [];
    }

    // Obter projetos do utilizador (limitado para performance)
    const projectModels = userModel.getProjectsModelArray();
    
    // Obter notificações não lidas do utilizador (limitado para performance)
    const unreadNotifications = userModel.getUnreadNotificationsQuerySet()
      .toRefArray()
      .slice(0, 100); // Limitar a 100 notificações para performance
    
    // Criar mapa de notificações por projeto (otimizado)
    const notificationsByProject = {};
    const processedProjects = new Set();
    
    unreadNotifications.forEach((notification) => {
      let projectId = null;
      
      if (notification.projectId) {
        projectId = notification.projectId;
      } else if (notification.boardId) {
        const boardModel = Board.withId(notification.boardId);
        if (boardModel) {
          projectId = boardModel.projectId;
        }
      }
      
      if (projectId && !processedProjects.has(projectId)) {
        // Contar notificações apenas para projetos que o usuário tem acesso
        const hasProjectAccess = projectModels.some(pm => pm.id === projectId);
        if (hasProjectAccess) {
          notificationsByProject[projectId] = (notificationsByProject[projectId] || 0) + 1;
          processedProjects.add(projectId);
        }
      }
    });

    // Retornar projetos com informações de notificações e background (limitado a 50 projetos para performance)
    const projectsWithData = projectModels
      .slice(0, 50)
      .map((projectModel) => {
        const project = projectModel.ref;
        const notificationCount = notificationsByProject[project.id] || 0;
        
        return {
          id: project.id,
          name: project.name,
          isFavorite: !!project.isFavorite,
          isHidden: !!project.isHidden,
          hasNotifications: notificationCount > 0,
          notificationCount: notificationCount > 99 ? '99+' : notificationCount,
          // Adicionar informações de background
          backgroundType: project.backgroundType,
          backgroundGradient: project.backgroundGradient,
          backgroundImageId: project.backgroundImageId,
        };
      });

    // Aplicar ordenação personalizada se existir
    if (customOrder && customOrder.length > 0) {
      const orderMap = {};
      customOrder.forEach((projectId, index) => {
        orderMap[projectId] = index;
      });
      
      return projectsWithData.sort((a, b) => {
        const orderA = orderMap[a.id] !== undefined ? orderMap[a.id] : 999;
        const orderB = orderMap[b.id] !== undefined ? orderMap[b.id] : 999;
        return orderA - orderB;
      });
    }
    
    // Filtrar projetos ocultos e ordenar alfabeticamente por padrão
    return projectsWithData
      .filter((p) => !p.isHidden)
      .sort((a, b) => a.name.localeCompare(b.name));
  },
);

// Lista apenas de favoritos (já filtrados e ordenados)
export const selectSidebarFavoriteProjects = createSelector(
  selectSidebarProjects,
  (projects) => projects.filter((p) => p.isFavorite),
);

// Lista de não favoritos (já filtrados e ordenados)
export const selectSidebarOtherProjects = createSelector(
  selectSidebarProjects,
  (projects) => projects.filter((p) => !p.isFavorite),
);

// Selector para total de projetos (para mostrar indicador de "mais projetos")
export const selectTotalProjectsCount = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  ({ User }, userId) => {
    if (!userId) {
      return 0;
    }

    const userModel = User.withId(userId);
    if (!userModel || !userModel.getProjectsModelArray) {
      return 0;
    }

    return userModel.getProjectsModelArray().length;
  },
);
