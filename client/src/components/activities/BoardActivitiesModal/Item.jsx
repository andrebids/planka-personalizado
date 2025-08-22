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
  const selectActivityById = useMemo(
    () => selectors.makeSelectActivityById(),
    []
  );
  const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);
  const selectAttachmentsForCard = useMemo(
    () => selectors.makeSelectAttachmentsForCard(),
    []
  );

  const activity = useSelector(state => selectActivityById(state, id));
  const user = useSelector(state => selectUserById(state, activity?.userId));
  const card = useSelector(state => selectCardById(state, activity?.cardId));
  const attachments = useSelector(state =>
    selectAttachmentsForCard(state, activity?.cardId)
  );

  // Verificação de segurança para evitar erros quando activity ou user estão undefined
  if (!activity) {
    console.warn('Activity não encontrada para ID:', id);
    return null;
  }

  if (!user) {
    console.warn('User não encontrado para activity:', activity.id, 'userId:', activity.userId);
    return null;
  }

  const [t] = useTranslation();
  const [activateClosable, deactivateClosable] = useContext(ClosableContext);

  const handleBeforeGalleryOpen = useCallback(
    gallery => {
      activateClosable();
      gallery.on('destroy', () => {
        deactivateClosable();
      });
    },
    [activateClosable, deactivateClosable]
  );

  const userName =
    user.id === StaticUserIds.DELETED
      ? t(`common.${user.name}`, {
          context: 'title',
        })
      : user.name;

  const cardName = card ? card.name : activity.data?.card?.name || 'Cartão desconhecido';

  // Filtrar anexos de imagem para mostrar thumbnails
  const imageAttachments = (attachments || []).filter(
    attachment =>
      attachment.type === AttachmentTypes.FILE &&
      attachment.data &&
      attachment.data.image &&
      attachment.data.thumbnailUrls &&
      canPreviewFile(attachment)
  );

  // Mostrar apenas a primeira imagem (agora ocupa largura completa)
  // Não mostrar imagens quando se cria um cartão, uma tarefa ou atividades de comentário
  const thumbnailAttachments =
    activity.type === ActivityTypes.CREATE_CARD ||
    activity.type === ActivityTypes.CREATE_TASK ||
    activity.type === ActivityTypes.COMMENT_CREATE ||
    activity.type === ActivityTypes.COMMENT_UPDATE ||
    activity.type === ActivityTypes.COMMENT_DELETE ||
    activity.type === ActivityTypes.COMMENT_REPLY
      ? []
      : imageAttachments.slice(0, 1);

  let contentNode;
  switch (activity.type) {
    case ActivityTypes.CREATE_CARD: {
      const { list } = activity.data || {};
      const listName = list?.name || t(`common.${list?.type}`) || 'Lista desconhecida';

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
          <Link to={Paths.CARDS.replace(':id', activity.cardId)}>
            {cardName}
          </Link>
          {' to '}
          {listName}
        </Trans>
      );

      break;
    }
    case ActivityTypes.MOVE_CARD: {
      const { fromList, toList } = activity.data || {};

      const fromListName = fromList?.name || t(`common.${fromList?.type}`) || 'Lista origem desconhecida';
      const toListName = toList?.name || t(`common.${toList?.type}`) || 'Lista destino desconhecida';

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
          <Link to={Paths.CARDS.replace(':id', activity.cardId)}>
            {cardName}
          </Link>
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
        user.id === activity.data?.user?.id ? (
          <Trans
            i18nKey="common.userJoinedCard"
            values={{
              user: userName,
              card: cardName,
            }}
          >
            <span className={styles.author}>{userName}</span>
            {' joined '}
            <Link to={Paths.CARDS.replace(':id', activity.cardId)}>
              {cardName}
            </Link>
          </Trans>
        ) : (
          <Trans
            i18nKey="common.userAddedUserToCard"
            values={{
              actorUser: userName,
              addedUser: activity.data?.user?.name || 'Utilizador desconhecido',
              card: cardName,
            }}
          >
            <span className={styles.author}>{userName}</span>
            {' added '}
            {activity.data?.user?.name || 'Utilizador desconhecido'}
            {' to '}
            <Link to={Paths.CARDS.replace(':id', activity.cardId)}>
              {cardName}
            </Link>
          </Trans>
        );

      break;
    case ActivityTypes.REMOVE_MEMBER_FROM_CARD:
      contentNode = (
        <Trans
          i18nKey="common.userRemovedUserFromCard"
          values={{
            actorUser: userName,
            removedUser: activity.data?.user?.name || 'Utilizador desconhecido',
            card: cardName,
          }}
        >
          <span className={styles.author}>{userName}</span>
          {' removed '}
          {activity.data?.user?.name || 'Utilizador desconhecido'}
          {' from '}
          <Link to={Paths.CARDS.replace(':id', activity.cardId)}>
            {cardName}
          </Link>
        </Trans>
      );

      break;
    case ActivityTypes.CREATE_ATTACHMENT: {
      const { attachmentName, isVideo, thumbnailUrls, videoData } = activity.data || {};
      const displayName = attachmentName || 'Anexo desconhecido';
      const isVideoFile = isVideo === true;

      // Determinar a chave de tradução baseada no tipo de arquivo
      const translationKey = isVideoFile ? 'common.userCreatedVideoOnCard' : 'common.userCreatedAttachmentOnCard';

      contentNode = (
        <>
          <Trans
            i18nKey={translationKey}
            values={{
              user: userName,
              attachment: displayName,
              card: cardName,
            }}
          >
            <span className={styles.author}>{userName}</span>
            {isVideoFile ? ' adicionou vídeo ' : ' criou anexo '}
            <strong>{displayName}</strong>
            {isVideoFile ? ' ao ' : ' em '}
            <Link to={Paths.CARDS.replace(':id', activity.cardId)}>
              {cardName}
            </Link>
          </Trans>

          {/* Mostrar thumbnail de vídeo se disponível */}
          {isVideoFile && thumbnailUrls && thumbnailUrls.outside360 && (
            <div className={styles.videoThumbnail}>
              <img
                src={thumbnailUrls.outside360}
                alt={displayName}
                className={styles.thumbnailImage}
              />
              {videoData && videoData.duration && (
                <div className={styles.videoDuration}>
                  {Math.round(videoData.duration)}s
                </div>
              )}
            </div>
          )}
        </>
      );

      break;
    }
    case ActivityTypes.DELETE_ATTACHMENT: {
      const { attachmentName, isVideo } = activity.data || {};
      const displayName = attachmentName || 'Anexo desconhecido';
      const isVideoFile = isVideo === true;

      // Determinar a chave de tradução baseada no tipo de arquivo
      const translationKey = isVideoFile ? 'common.userDeletedVideoOnCard' : 'common.userDeletedAttachmentOnCard';

      contentNode = (
        <Trans
          i18nKey={translationKey}
          values={{
            user: userName,
            attachment: displayName,
            card: cardName,
          }}
        >
          <span className={styles.author}>{userName}</span>
          {isVideoFile ? ' removeu vídeo ' : ' excluiu anexo '}
          <strong>{displayName}</strong>
          {' de '}
          <Link to={Paths.CARDS.replace(':id', activity.cardId)}>
            {cardName}
          </Link>
        </Trans>
      );

      break;
    }
    case ActivityTypes.COMMENT_CREATE:
    case ActivityTypes.COMMENT_UPDATE:
    case ActivityTypes.COMMENT_DELETE:
    case ActivityTypes.COMMENT_REPLY: {
                  // Extrair dados com verificações de segurança
            const { commentText, cardName: activityCardName, mentions, isReply, action } = activity.data || {};

      // Usar padrão direto como outros casos
      const getActionText = (action) => {
        switch (action) {
          case 'create': return isReply ? ' respondeu a um comentário no ' : ' comentou no ';
          case 'update': return ' editou comentário no ';
          case 'delete': return ' removeu comentário no ';
          case 'reply': return ' respondeu a um comentário no ';
          default: return ' comentou no ';
        }
      };

      contentNode = (
        <>
          <span className={styles.author}>{userName}</span>
          {getActionText(action)}
          <Link to={Paths.CARDS.replace(':id', activity.cardId)}>
            {activityCardName || cardName}
          </Link>
        </>
      );

      // Adicionar texto do comentário ao contentNode
      if (action !== 'delete' && commentText) {
        contentNode = (
          <>
            {contentNode}
            <div className={styles.commentText}>
              <div className={styles.commentContent}>
                {commentText}
              </div>
              {mentions && mentions.length > 0 && (
                <div className={styles.mentions}>
                  {mentions.map((mention, index) => (
                    <span key={index} className={styles.mention}>
                      @{mention}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        );
      }

      if (action === 'delete') {
        contentNode = (
          <>
            {contentNode}
            <div className={styles.deletedComment}>
              <em>[Comentário removido]</em>
            </div>
          </>
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
      <Comment className={styles.commentActivity}>
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
                {thumbnailAttachments.map(attachment => (
                  <GalleryItem
                    key={attachment.id}
                    src={attachment.data.url}
                    width={attachment.data.image ? attachment.data.image.width : undefined}
                    height={attachment.data.image ? attachment.data.image.height : undefined}
                    original={attachment.data.url}
                    caption={attachment.name}
                  >
                    {({ ref, open }) => (
                      <img
                        ref={ref}
                        src={
                          attachment.data.thumbnailUrls.outside720 ||
                          attachment.data.thumbnailUrls.outside360
                        }
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
