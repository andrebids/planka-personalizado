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
    values: {
      type: 'json',
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
    const { values } = inputs;

    const comment = await Comment.qm.updateOne(inputs.record.id, values);

    // Criar atividade para atualização do comentário
    if (comment) {
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
          commentId: comment.id,
          commentText: comment.text.substring(0, 150), // Limitar a 150 chars
          cardName: inputs.card.name,
          cardId: inputs.card.id,
          mentions: extractMentions(comment.text),
          isReply: isReplyToComment(comment.text),
          action: 'update'
        };

        // Criar atividade diretamente
        const activity = await Action.create({
          type: 'commentUpdate',
          data: activityData,
          boardId: inputs.board.id,
          cardId: inputs.card.id,
          userId: inputs.actorUser.id,
        }).fetch();


      } catch (activityError) {
        console.error('❌ Erro ao criar atividade de atualização de comentário:', activityError);
        // Não falhar a atualização do comentário se a atividade falhar
      }
    }

    if (comment) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'commentUpdate',
        {
          item: comment,
        },
        inputs.request,
      );

      sails.helpers.utils.sendWebhooks.with({
        event: 'commentUpdate',
        buildData: () => ({
          item: comment,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
            lists: [inputs.list],
            cards: [inputs.card],
          },
        }),
        buildPrevData: () => ({
          item: inputs.record,
        }),
        user: inputs.actorUser,
      });
    }

    return comment;
  },
};
