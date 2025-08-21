/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    record: {
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
    card: {
      type: 'ref',
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    // Criar atividade para remoção do comentário (antes de remover)
    try {
      // Extrair menções do texto do comentário
      const extractMentions = (text) => {
        const mentionRegex = /@(\w+)/g;
        const matches = text.match(mentionRegex) || [];
        return matches.map(match => match.substring(1));
      };

      // Determinar se é resposta a outro comentário
      const isReplyToComment = (text) => {
        return text.includes('@') && text.length > 0;
      };

      // Criar dados da atividade
      const activityData = {
        commentId: inputs.record.id,
        commentText: inputs.record.text.substring(0, 150), // Limitar a 150 chars
        cardName: inputs.card.name,
        cardId: inputs.card.id,
        mentions: extractMentions(inputs.record.text),
        isReply: isReplyToComment(inputs.record.text),
        action: 'delete'
      };

      // Criar atividade diretamente
      const activity = await Action.create({
        type: 'commentDelete',
        data: activityData,
        boardId: inputs.board.id,
        cardId: inputs.card.id,
        userId: inputs.actorUser.id,
      }).fetch();

      console.log('✅ Atividade de remoção de comentário criada no histórico:', {
        activityId: activity.id,
        type: activity.type,
        commentId: inputs.record.id
      });
    } catch (activityError) {
      console.error('❌ Erro ao criar atividade de remoção de comentário:', activityError);
      // Não falhar a remoção do comentário se a atividade falhar
    }

    const comment = await Comment.qm.deleteOne(inputs.record.id);

    if (comment) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'commentDelete',
        {
          item: comment,
        },
        inputs.request,
      );

      sails.helpers.utils.sendWebhooks.with({
        event: 'commentDelete',
        buildData: () => ({
          item: comment,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
            lists: [inputs.list],
            cards: [inputs.card],
          },
        }),
        user: inputs.actorUser,
      });
    }

    return comment;
  },
};
