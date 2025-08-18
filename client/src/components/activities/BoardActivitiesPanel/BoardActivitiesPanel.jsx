/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';
import { selectIsTimelinePanelExpanded } from '../../../selectors/timelinePanelSelectors';
import entryActions from '../../../entry-actions';

import styles from './BoardActivitiesPanel.module.scss';

const BoardActivitiesPanel = React.memo(() => {
  const isExpanded = useSelector(selectIsTimelinePanelExpanded);
  const panelRef = useRef(null);
  const [t] = useTranslation();

  const dispatch = useDispatch();

  const handleToggle = useCallback(() => {
    dispatch(entryActions.toggleTimelinePanel());
  }, [dispatch]);

  return (
    <div
      ref={panelRef}
      className={`${styles.panel} ${isExpanded ? styles.expanded : styles.collapsed} glass-panel`}
      role="complementary"
      aria-label={t('common.boardActions', { context: 'title' })}
    >
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>
          {isExpanded ? t('common.boardActions', { context: 'title' }) : ''}
        </h3>
        <button
          type="button"
          className={styles.toggleButton}
          onClick={handleToggle}
          aria-label={isExpanded ? 'Recolher painel' : 'Expandir painel'}
        >
          <Icon fitted name={isExpanded ? "chevron right" : "chevron left"} />
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className={styles.content}>
          <div className={styles.placeholder}>
            <Icon name="clock outline" size="large" />
            <p>{t('common.loading')}</p>
          </div>
        </div>
      )}
    </div>
  );
});

export default BoardActivitiesPanel;
