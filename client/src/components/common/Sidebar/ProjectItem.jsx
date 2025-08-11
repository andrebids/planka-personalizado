/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import NotificationIndicator from './NotificationIndicator';
import entryActions from '../../../entry-actions';
import styles from './ProjectItem.module.scss';

const ProjectItem = React.memo(({ project }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClick = () => {
    // Fechar sidebar em mobile
    dispatch(entryActions.toggleSidebar());
    
    // Marcar notificações do projeto como lidas (se houver)
    if (project.hasNotifications) {
      // TODO: Implementar action para marcar notificações como lidas
      console.log('Marcar notificações como lidas para projeto:', project.id);
    }
    
    // Navegar para o projeto
    navigate(`/projects/${project.id}`);
  };

  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.hasNotifications]: project.hasNotifications,
      })}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <div className={styles.content}>
        <span className={styles.name}>{project.name}</span>
        {project.hasNotifications && (
          <NotificationIndicator count={project.notificationCount} />
        )}
      </div>
    </div>
  );
});

ProjectItem.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    hasNotifications: PropTypes.bool,
    notificationCount: PropTypes.number,
  }).isRequired,
};

export default ProjectItem;
