/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo, useState, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Comment } from 'semantic-ui-react';
import { Gallery, Item as GalleryItem } from 'react-photoswipe-gallery';

import selectors from '../../../selectors';
import Paths from '../../../constants/Paths';
import { StaticUserIds } from '../../../constants/StaticUsers';
import { ActivityTypes, AttachmentTypes } from '../../../constants/Enums';
import { canPreviewFile } from '../../../utils/fileTypeUtils';
import { ClosableContext } from '../../../contexts';
import TimeAgo from '../../common/TimeAgo';
import UserAvatar from '../../users/UserAvatar';

import styles from './Item.module.scss';

const Item = React.memo(({ id }) => {
  const selectActivityById = useMemo(() => selectors.makeSelectActivityById(), []);
  const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);
  const selectAttachmentsForCard = useMemo(() => selectors.makeSelectAttachmentsForCard(), []);

  const activity = useSelector((state) => selectActivityById(state, id));
  const user = useSelector((state) => selectUserById(state, activity.userId));
  const card = useSelector((state) => selectCardById(state, activity.cardId));
  const attachments = useSelector((state) => selectAttachmentsForCard(state, activity.cardId));

  const [t] = useTranslation();
  const [activateClosable, deactivateClosable] = useContext(ClosableContext);

  const handleBeforeGalleryOpen = useCallback(
    (gallery) => {
      activateClosable();
      gallery.on('destroy', () => {
        deactivateClosable();
      });
    },
    [activateClosable, deactivateClosable],
  );

  const userName =
    user.id === StaticUserIds.DELETED
      ? t(`common.${user.name}`, {
          context: 'title',
        })
      : user.name;

  const cardName = card ? card.name : activity.data.card.name;

  // Filtrar anexos de imagem para mostrar thumbnails
  const imageAttachments = (attachments || []).filter(
    (attachment) =>
      attachment.type === AttachmentTypes.FILE &&
      attachment.data.image &&
      attachment.data.thumbnailUrls &&
      canPreviewFile(attachment)
  );

  // Mostrar apenas a primeira imagem (agora ocupa largura completa)
  const thumbnailAttachments = imageAttachments.slice(0, 1);

  let contentNode;
  switch (activity.type) {
    case ActivityTypes.CREATE_CARD: {
      const { list } = activity.data;
      const listName = list.name || t(`common.${list.type}`);

      contentNode = (
        <Trans
          i18nKey="common.userAddedCardToList"
          values={{
            user: userName,
            card: cardName,
            list: listName,
          }}
        >
          <span className={styles.author}>{userName}</span>
          {' added '}
          <Link to={Paths.CARDS.replace(':id', activity.cardId)}>{cardName}</Link>
          {' to '}
          {listName}
        </Trans>
      );

      break;
    }
    case ActivityTypes.MOVE_CARD: {
      const { fromList, toList } = activity.data;

      const fromListName = fromList.name || t(`common.${fromList.type}`);
      const toListName = toList.name || t(`common.${toList.type}`);

      contentNode = (
        <Trans
          i18nKey="common.userMovedCardFromListToList"
          values={{
            user: userName,
            card: cardName,
            fromList: fromListName,
            toList: toListName,
          }}
        >
          <span className={styles.author}>{userName}</span>
          {' moved '}
          <Link to={Paths.CARDS.replace(':id', activity.cardId)}>{cardName}</Link>
          {' from '}
          {fromListName}
          {' to '}
          {toListName}
        </Trans>
      );

      break;
    }
    case ActivityTypes.ADD_MEMBER_TO_CARD:
      contentNode =
        user.id === activity.data.user.id ? (
          <Trans
            i18nKey="common.userJoinedCard"
            values={{
              user: userName,
              card: cardName,
            }}
          >
            <span className={styles.author}>{userName}</span>
            {' joined '}
            <Link to={Paths.CARDS.replace(':id', activity.cardId)}>{cardName}</Link>
          </Trans>
        ) : (
          <Trans
            i18nKey="common.userAddedUserToCard"
            values={{
              actorUser: userName,
              addedUser: activity.data.user.name,
              card: cardName,
            }}
          >
            <span className={styles.author}>{userName}</span>
            {' added '}
            {activity.data.user.name}
            {' to '}
            <Link to={Paths.CARDS.replace(':id', activity.cardId)}>{cardName}</Link>
          </Trans>
        );

      break;
    case ActivityTypes.REMOVE_MEMBER_FROM_CARD:
      contentNode = (
        <Trans
          i18nKey="common.userRemovedUserFromCard"
          values={{
            actorUser: userName,
            removedUser: activity.data.user.name,
            card: cardName,
          }}
        >
          <span className={styles.author}>{userName}</span>
          {' removed '}
          {activity.data.user.name}
          {' from '}
          <Link to={Paths.CARDS.replace(':id', activity.cardId)}>{cardName}</Link>
        </Trans>
      );

      break;
    case ActivityTypes.CREATE_ATTACHMENT:
      contentNode = (
        <Trans
          i18nKey="common.userAddedAttachmentToCard"
          values={{
            user: userName,
            card: cardName,
          }}
        >
          <span className={styles.author}>{userName}</span>
          {' added attachment to '}
          <Link to={Paths.CARDS.replace(':id', activity.cardId)}>{cardName}</Link>
        </Trans>
      );

      break;
    case ActivityTypes.SET_DUE_DATE: {
      const { oldDueDate, newDueDate } = activity.data;
      
      const formatDate = (date) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString();
      };

      const oldDate = formatDate(oldDueDate);
      const newDate = formatDate(newDueDate);

      if (!oldDueDate && newDueDate) {
        // Data de vencimento adicionada
        contentNode = (
          <Trans
            i18nKey="common.userSetDueDateToCard"
            values={{
              user: userName,
              card: cardName,
              date: newDate,
            }}
          >
            <span className={styles.author}>{userName}</span>
            {' set due date to '}
            <strong>{newDate}</strong>
            {' for '}
            <Link to={Paths.CARDS.replace(':id', activity.cardId)}>{cardName}</Link>
          </Trans>
        );
      } else if (oldDueDate && !newDueDate) {
        // Data de vencimento removida
        contentNode = (
          <Trans
            i18nKey="common.userRemovedDueDateFromCard"
            values={{
              user: userName,
              card: cardName,
            }}
          >
            <span className={styles.author}>{userName}</span>
            {' removed due date from '}
            <Link to={Paths.CARDS.replace(':id', activity.cardId)}>{cardName}</Link>
          </Trans>
        );
      } else {
        // Data de vencimento alterada
        contentNode = (
          <Trans
            i18nKey="common.userChangedDueDateOfCard"
            values={{
              user: userName,
              card: cardName,
              oldDate: oldDate,
              newDate: newDate,
            }}
          >
            <span className={styles.author}>{userName}</span>
            {' changed due date from '}
            <strong>{oldDate}</strong>
            {' to '}
            <strong>{newDate}</strong>
            {' for '}
            <Link to={Paths.CARDS.replace(':id', activity.cardId)}>{cardName}</Link>
          </Trans>
        );
      }

      break;
    }
    default:
      contentNode = (
        <Trans
          i18nKey="common.activityLogMessage"
          values={{
            user: userName,
            card: cardName,
          }}
        >
          <span className={styles.author}>{userName}</span>
        </Trans>
      );
  }

  return (
    <>
      <Comment>
        <span className={styles.user}>
          <UserAvatar id={activity.userId} />
        </span>
        <div className={styles.content}>
          <div>{contentNode}</div>
          {thumbnailAttachments.length > 0 && (
            <div className={styles.thumbnails}>
              <Gallery
                withCaption
                withDownloadButton
                options={{
                  wheelToZoom: true,
                  showHideAnimationType: 'none',
                  closeTitle: '',
                  zoomTitle: '',
                  arrowPrevTitle: '',
                  arrowNextTitle: '',
                  errorMsg: '',
                }}
                onBeforeOpen={handleBeforeGalleryOpen}
             >
                {thumbnailAttachments.map((attachment) => (
                  <GalleryItem
                    key={attachment.id}
                    {...attachment.data.image} // eslint-disable-line react/jsx-props-no-spreading
                    original={attachment.data.url}
                    caption={attachment.name}
                  >
                    {({ ref, open }) => (
                      <img
                        ref={ref}
                        src={attachment.data.thumbnailUrls.outside720 || attachment.data.thumbnailUrls.outside360}
                        alt={attachment.name}
                        className={styles.thumbnail}
                        onClick={open}
                      />
                    )}
                  </GalleryItem>
                ))}
              </Gallery>
            </div>
          )}
          <span className={styles.date}>
            <TimeAgo date={activity.createdAt} />
          </span>
        </div>
      </Comment>
    </>
  );
});

Item.propTypes = {
  id: PropTypes.string.isRequired,
};

export default Item;
