/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

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

ProjectOrderControls.propTypes = {};

export default ProjectOrderControls;
