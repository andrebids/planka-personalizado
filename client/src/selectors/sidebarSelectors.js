/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';
import { selectCurrentUserId } from './users';

export const selectSidebarState = (state) => state.sidebar;
export const selectIsSidebarExpanded = (state) => selectSidebarState(state).isExpanded;

// Selector para projetos do sidebar com informações de notificações
export const selectSidebarProjects = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  ({ User }, userId) => {
    if (!userId) {
      return [];
    }

    const userModel = User.withId(userId);
    if (!userModel) {
      return [];
    }

    // Obter todos os projetos do utilizador
    const projectModels = userModel.getProjectsModelArray();
    
    // Obter notificações não lidas do utilizador
    const unreadNotifications = userModel.getUnreadNotificationsQuerySet().toRefArray();
    
    // Criar mapa de notificações por projeto
    const notificationsByProject = {};
    unreadNotifications.forEach((notification) => {
      // Verificar se a notificação está relacionada com um projeto
      // Pode ser através de boardId, cardId, ou projectId direto
      let projectId = null;
      
      if (notification.projectId) {
        projectId = notification.projectId;
      } else if (notification.boardId) {
        // Tentar encontrar o projeto através do board
        const boardModel = userModel.orm.Board.withId(notification.boardId);
        if (boardModel) {
          projectId = boardModel.projectId;
        }
      }
      
      if (projectId) {
        if (!notificationsByProject[projectId]) {
          notificationsByProject[projectId] = 0;
        }
        notificationsByProject[projectId]++;
      }
    });

    // Retornar projetos com informações de notificações
    return projectModels.map((projectModel) => {
      const project = projectModel.ref;
      const notificationCount = notificationsByProject[project.id] || 0;
      
      return {
        id: project.id,
        name: project.name,
        hasNotifications: notificationCount > 0,
        notificationCount,
      };
    });
  },
);
