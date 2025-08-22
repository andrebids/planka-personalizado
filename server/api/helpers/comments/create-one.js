/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const escapeMarkdown = require('escape-markdown');
const escapeHtml = require('escape-html');

const { extractMentionIds, formatTextWithMentions } = require('../../../utils/mentions');

const buildAndSendNotifications = async (services, board, card, comment, actorUser, t) => {
  const markdownCardLink = `[${escapeMarkdown(card.name)}](${sails.config.custom.baseUrl}/cards/${card.id})`;
  const htmlCardLink = `<a href="${sails.config.custom.baseUrl}/cards/${card.id}}">${escapeHtml(card.name)}</a>`;
  const commentText = _.truncate(formatTextWithMentions(comment.text));

  await sails.helpers.utils.sendNotifications(services, t('New Comment'), {
    text: `${t(
      '%s left a new comment to %s on %s',
      actorUser.name,
      card.name,
      board.name,
    )}:\n${commentText}`,
    markdown: `${t(
      '%s left a new comment to %s on %s',
      escapeMarkdown(actorUser.name),
      markdownCardLink,
      escapeMarkdown(board.name),
    )}:\n\n*${escapeMarkdown(commentText)}*`,
    html: `${t(
      '%s left a new comment to %s on %s',
      escapeHtml(actorUser.name),
      htmlCardLink,
      escapeHtml(board.name),
    )}:\n\n<i>${escapeHtml(commentText)}</i>`,
  });
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      required: true,
    },
    project: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    list: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values } = inputs;

    console.log('🚀 [COMMENT-CREATE] Iniciando criação de comentário:', {
      cardId: values.card.id,
      cardName: values.card.name,
      userId: values.user.id,
      userName: values.user.name,
      boardId: inputs.board.id,
      boardName: inputs.board.name,
      commentText: values.text,
      timestamp: new Date().toISOString()
    });

    const comment = await Comment.qm.createOne({
      ...values,
      cardId: values.card.id,
      userId: values.user.id,
    });

    console.log('✅ [COMMENT-CREATE] Comentário criado com sucesso:', {
      commentId: comment.id,
      text: comment.text,
      cardId: comment.cardId,
      userId: comment.userId,
      createdAt: comment.createdAt
    });

    // Criar atividade para o comentário
    console.log('🔄 [COMMENT-CREATE] Iniciando criação de atividade para comentário:', {
      commentId: comment.id,
      boardId: inputs.board.id,
      cardId: values.card.id,
      userId: values.user.id
    });

    try {
      // Usar o helper de atividades de comentário
      const activity = await sails.helpers.activities.createCommentActivity.with({
        comment: comment,
        card: values.card,
        user: values.user,
        board: inputs.board,
        action: 'create'
      });

      console.log('✅ [COMMENT-CREATE] Atividade criada com sucesso:', {
        activityId: activity.id,
        activityType: activity.type,
        commentId: comment.id,
        timestamp: new Date().toISOString()
      });

    } catch (activityError) {
      console.error('❌ [COMMENT-CREATE] Erro ao criar atividade de comentário:', {
        error: activityError.message,
        stack: activityError.stack,
        commentId: comment.id,
        cardId: values.card.id,
        boardId: inputs.board.id
      });
      // Não falhar a criação do comentário se a atividade falhar
    }

    sails.sockets.broadcast(
      `board:${inputs.board.id}`,
      'commentCreate',
      {
        item: comment,
        included: {
          users: [sails.helpers.users.presentOne(values.user, {})],
        },
      },
      inputs.request,
    );

    sails.helpers.utils.sendWebhooks.with({
      event: 'commentCreate',
      buildData: () => ({
        item: comment,
        included: {
          projects: [inputs.project],
          boards: [inputs.board],
          lists: [inputs.list],
          cards: [values.card],
        },
      }),
      user: values.user,
    });

    let mentionUserIds = extractMentionIds(comment.text);

    if (mentionUserIds.length > 0) {
      const boardMemberUserIds = await sails.helpers.boards.getMemberUserIds(inputs.board.id);

      mentionUserIds = _.difference(
        _.intersection(mentionUserIds, boardMemberUserIds),
        comment.userId,
      );
    }

    const mentionUserIdsSet = new Set(mentionUserIds);

    const cardSubscriptionUserIds = await sails.helpers.cards.getSubscriptionUserIds(
      comment.cardId,
      comment.userId,
    );

    const boardSubscriptionUserIds = await sails.helpers.boards.getSubscriptionUserIds(
      inputs.board.id,
      comment.userId,
    );

    const notifiableUserIds = _.union(
      mentionUserIds,
      cardSubscriptionUserIds,
      boardSubscriptionUserIds,
    );

    await Promise.all(
      notifiableUserIds.map((userId) =>
        sails.helpers.notifications.createOne.with({
          values: {
            userId,
            comment,
            type: mentionUserIdsSet.has(userId)
              ? Notification.Types.MENTION_IN_COMMENT
              : Notification.Types.COMMENT_CARD,
            data: {
              card: _.pick(values.card, ['name']),
              text: comment.text,
            },
            creatorUser: values.user,
            card: values.card,
          },
          project: inputs.project,
          board: inputs.board,
          list: inputs.list,
        }),
      ),
    );

    if (values.user.subscribeToCardWhenCommenting) {
      let cardSubscription;
      try {
        cardSubscription = await CardSubscription.qm.createOne({
          cardId: comment.cardId,
          userId: comment.userId,
        });
      } catch (error) {
        if (error.code !== 'E_UNIQUE') {
          throw error;
        }
      }

      if (cardSubscription) {
        sails.sockets.broadcast(`user:${comment.userId}`, 'cardUpdate', {
          item: {
            id: comment.cardId,
            isSubscribed: true,
          },
        });

        // TODO: send webhooks
      }
    }

    const notificationServices = await NotificationService.qm.getByBoardId(inputs.board.id);

    if (notificationServices.length > 0) {
      const services = notificationServices.map((notificationService) =>
        _.pick(notificationService, ['url', 'format']),
      );

      buildAndSendNotifications(
        services,
        inputs.board,
        values.card,
        comment,
        values.user,
        sails.helpers.utils.makeTranslator(),
      );
    }

    return comment;
  },
};
