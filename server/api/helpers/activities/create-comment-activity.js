/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    comment: {
      type: 'ref',
      required: true,
    },
    card: {
      type: 'ref',
      required: true,
    },
    user: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    action: {
      type: 'string',
      isIn: ['create', 'update', 'delete', 'reply'],
      required: true,
    },
  },

  async fn(inputs) {
    const { comment, card, user, board, action } = inputs;

    console.log('🔄 Iniciando criação de atividade de comentário:', {
      commentId: comment.id,
      cardId: card.id,
      userId: user.id,
      action: action
    });

    try {
      // Extrair menções do texto do comentário (usando regex do projeto)
      const extractMentions = (text) => {
        const mentionRegex = /@(\w+)/g;
        const matches = text.match(mentionRegex) || [];
        return matches.map(match => match.substring(1));
      };

      // Determinar se é resposta a outro comentário
      const isReplyToComment = (text) => {
        return text.includes('@') && text.length > 0;
      };

      // Mapear ação para tipo de atividade (seguindo padrão do projeto)
      const getActivityType = (action) => {
        switch (action) {
          case 'create': return 'commentCreate';
          case 'update': return 'commentUpdate';
          case 'delete': return 'commentDelete';
          case 'reply': return 'commentReply';
          default: return 'commentCreate';
        }
      };

      // Criar dados da atividade (seguindo padrão existente)
      const activityData = {
        commentId: comment.id,
        commentText: comment.text.substring(0, 150), // Limitar a 150 chars
        cardName: card.name,
        cardId: card.id,
        mentions: extractMentions(comment.text),
        isReply: isReplyToComment(comment.text),
        action: action
      };

      // Criar atividade usando padrão existente
      const activity = await Action.create({
        type: getActivityType(action),
        data: activityData,
        boardId: board.id,
        cardId: card.id,
        userId: user.id,
      }).fetch();

      console.log('✅ Atividade de comentário criada:', {
        activityId: activity.id,
        type: activity.type,
        commentId: comment.id,
        cardName: card.name,
        timestamp: new Date().toISOString()
      });

      return activity;

    } catch (error) {
      console.error('❌ Erro ao criar atividade de comentário:', {
        error: error.message,
        commentId: comment.id,
        stack: error.stack
      });
      throw error;
    }
  },
};
