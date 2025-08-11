/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import NotificationIndicator from './NotificationIndicator';
import entryActions from '../../../entry-actions';
import { ProjectBackgroundTypes } from '../../../constants/Enums';
import selectors from '../../../selectors';
import globalStyles from '../../../styles.module.scss';
import styles from './ProjectItem.module.scss';

const ProjectItem = React.memo(({ project }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const selectBackgroundImageById = useMemo(() => selectors.makeSelectBackgroundImageById(), []);

  const backgroundImageUrl = useSelector((state) => {
    if (!project.backgroundType || project.backgroundType !== ProjectBackgroundTypes.IMAGE) {
      return null;
    }

    const backgroundImage = selectBackgroundImageById(state, project.backgroundImageId);

    if (!backgroundImage) {
      return null;
    }

    return backgroundImage.thumbnailUrls.outside360;
  });

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
        [styles.draggable]: true, // Indicar que é arrastável
      })}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      title={project.name} // Tooltip com nome completo
    >
      <div className={styles.content}>
        <div className={styles.dragHandle}>
          <i className="fas fa-grip-vertical" />
        </div>
        <div className={styles.thumbnailContainer}>
          <div
            className={classNames(
              styles.projectThumbnail,
              project.backgroundType === ProjectBackgroundTypes.GRADIENT &&
                globalStyles[`background${upperFirst(camelCase(project.backgroundGradient))}`],
            )}
            style={{
              background: backgroundImageUrl && `url("${backgroundImageUrl}") center / cover`,
            }}
          />
          {project.hasNotifications && (
            <div className={styles.notificationOverlay}>
              <NotificationIndicator />
            </div>
          )}
        </div>
        <span className={styles.name}>{project.name}</span>
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
    backgroundType: PropTypes.string,
    backgroundGradient: PropTypes.string,
    backgroundImageId: PropTypes.string,
  }).isRequired,
};

export default ProjectItem;
