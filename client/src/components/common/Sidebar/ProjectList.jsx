/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import ProjectItem from './ProjectItem';
import ProjectOrderControls from './ProjectOrderControls';
import { selectSidebarProjects, selectTotalProjectsCount } from '../../../selectors/sidebarSelectors';
import { saveProjectsOrder, loadProjectsOrder } from '../../../actions/sidebarActions';
import ActionTypes from '../../../constants/ActionTypes';

import styles from './ProjectList.module.scss';

const ProjectList = React.memo(() => {
  const dispatch = useDispatch();
  const projects = useSelector(selectSidebarProjects);
  const totalProjectsCount = useSelector(selectTotalProjectsCount);
  const [showAll, setShowAll] = useState(false);

  // Carregar ordenação na inicialização
  useEffect(() => {
    const savedOrder = localStorage.getItem('planka_projects_order');
    if (savedOrder) {
      try {
        const order = JSON.parse(savedOrder);
        dispatch(loadProjectsOrder(order));
      } catch (error) {
        console.warn('Erro ao carregar ordenação:', error);
        localStorage.removeItem('planka_projects_order');
      }
    }
  }, [dispatch]);

  // Limitar projetos para performance (mostrar apenas 20 inicialmente)
  const displayedProjects = useMemo(() => {
    if (showAll) {
      return projects;
    }
    return projects.slice(0, 20);
  }, [projects, showAll]);

  const hasMoreProjects = totalProjectsCount > displayedProjects.length;

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
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
});

ProjectList.propTypes = {};

export default ProjectList;
