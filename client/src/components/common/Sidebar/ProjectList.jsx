/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import ProjectItem from './ProjectItem';
import { selectSidebarProjects } from '../../../selectors/sidebarSelectors';

import styles from './ProjectList.module.scss';

const ProjectList = React.memo(() => {
  const projects = useSelector(selectSidebarProjects);

  // Calcular total de notificações
  const totalNotifications = projects.reduce((total, project) => {
    return total + (project.notificationCount || 0);
  }, 0);

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
      <h3 className={styles.title}>
        MEUS PROJETOS
        {totalNotifications > 0 && (
          <span className={styles.notificationBadge}>
            {totalNotifications}
          </span>
        )}
      </h3>
      <div className={styles.list}>
        {projects.map((project) => (
          <ProjectItem
            key={project.id}
            project={project}
          />
        ))}
      </div>
    </div>
  );
});

ProjectList.propTypes = {};

export default ProjectList;
