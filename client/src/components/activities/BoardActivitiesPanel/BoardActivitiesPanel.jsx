/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { Comment, Icon, Loader } from "semantic-ui-react";

import selectors from "../../../selectors";
import { selectIsTimelinePanelExpanded } from "../../../selectors/timelinePanelSelectors";
import entryActions from "../../../entry-actions";
import Item from "../BoardActivitiesModal/Item";

import styles from "./BoardActivitiesPanel.module.scss";

const BoardActivitiesPanel = React.memo(() => {
  const isExpanded = useSelector(selectIsTimelinePanelExpanded);
  const activityIds =
    useSelector(selectors.selectActivityIdsForCurrentBoard) || [];
  const currentBoard = useSelector(selectors.selectCurrentBoard);
  const isActivitiesFetching = currentBoard
    ? currentBoard.isActivitiesFetching
    : false;
  const isAllActivitiesFetched = currentBoard
    ? currentBoard.isAllActivitiesFetched
    : true;

  const panelRef = useRef(null);
  const [t] = useTranslation();

  const dispatch = useDispatch();

  const handleToggle = useCallback(() => {
    dispatch(entryActions.toggleTimelinePanel());
  }, [dispatch]);

  const [inViewRef] = useInView({
    threshold: 1,
    onChange: (inView) => {
      if (inView) {
        dispatch(entryActions.fetchActivitiesInCurrentBoard());
      }
    },
  });

  return (
    <div
      ref={panelRef}
      className={`${styles.panel} ${isExpanded ? styles.expanded : styles.collapsed} glass-panel`}
      role="complementary"
      aria-label={t("common.boardActions_title")}
    >
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>
          {isExpanded ? t("common.boardActions_title") : ""}
        </h3>
        <button
          type="button"
          className={styles.toggleButton}
          onClick={handleToggle}
          aria-label={
            isExpanded ? t("action.collapsePanel") : t("action.expandPanel")
          }
        >
          <Icon fitted name={isExpanded ? "chevron right" : "chevron left"} />
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className={styles.content}>
          <div className={styles.itemsWrapper}>
            <Comment.Group className={styles.items}>
              {activityIds.map((activityId) => (
                <Item key={activityId} id={activityId} />
              ))}
            </Comment.Group>
          </div>
          {isActivitiesFetching && (
            <div className={styles.loaderWrapper}>
              <Loader active inverted inline="centered" size="small" />
            </div>
          )}
          {!isActivitiesFetching && !isAllActivitiesFetched && (
            <div className={styles.loaderWrapper}>
              <div ref={inViewRef} />
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default BoardActivitiesPanel;
