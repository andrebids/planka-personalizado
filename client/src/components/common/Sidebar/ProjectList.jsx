/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import ProjectItem from './ProjectItem';
import { selectSidebarProjects, selectTotalProjectsCount } from '../../../selectors/sidebarSelectors';

import styles from './ProjectList.module.scss';

const ProjectList = React.memo(() => {
  const projects = useSelector(selectSidebarProjects);
  const totalProjectsCount = useSelector(selectTotalProjectsCount);
  const [showAll, setShowAll] = useState(false);

  // Limitar projetos para performance (mostrar apenas 20 inicialmente)
  const displayedProjects = useMemo(() => {
    if (showAll) {
      return projects;
    }
    return projects.slice(0, 20);
  }, [projects, showAll]);

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
      <div className={styles.list}>
        {displayedProjects.map((project) => (
          <ProjectItem
            key={project.id}
            project={project}
          />
        ))}
        
        {/* Indicador de mais projetos */}
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
    </div>
  );
});

ProjectList.propTypes = {};

export default ProjectList;
