/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';

import styles from './NotificationIndicator.module.scss';

const NotificationIndicator = React.memo(({ count = 1 }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.dot} />
      {count > 1 && (
        <span className={styles.count}>{count}</span>
      )}
    </div>
  );
});

NotificationIndicator.propTypes = {
  count: PropTypes.number,
};

export default NotificationIndicator;
