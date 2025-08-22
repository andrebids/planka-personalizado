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

    console.log('🔄 [ACTIVITY-CREATE] Iniciando criação de atividade de comentário:', {
      commentId: comment.id,
      commentText: comment.text,
      cardId: card.id,
      cardName: card.name,
      userId: user.id,
      userName: user.name,
      boardId: board.id,
      boardName: board.name,
      action: action,
      timestamp: new Date().toISOString()
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

      console.log('📝 [ACTIVITY-CREATE] Dados da atividade preparados:', {
        activityType: getActivityType(action),
        activityData: activityData,
        boardId: board.id,
        cardId: card.id,
        userId: user.id
      });

      // Criar atividade usando padrão existente
      const activity = await Action.create({
        type: getActivityType(action),
        data: activityData,
        boardId: board.id,
        cardId: card.id,
        userId: user.id,
      }).fetch();

      console.log('💾 [ACTIVITY-CREATE] Atividade salva no banco de dados:', {
        activityId: activity.id,
        type: activity.type,
        data: activity.data,
        boardId: activity.boardId,
        cardId: activity.cardId,
        userId: activity.userId,
        createdAt: activity.createdAt
      });

      console.log('✅ [ACTIVITY-CREATE] Atividade de comentário criada com sucesso:', {
        activityId: activity.id,
        type: activity.type,
        commentId: comment.id,
        cardName: card.name,
        timestamp: new Date().toISOString()
      });

      // Enviar atividade via socket para atualização instantânea no frontend
      sails.sockets.broadcast(
        `board:${board.id}`,
        'actionCreate',
        {
          item: activity,
        },
        inputs.request || {}
      );

      console.log('📡 [ACTIVITY-CREATE] Atividade enviada via socket para atualização instantânea:', {
        activityId: activity.id,
        boardId: board.id,
        timestamp: new Date().toISOString()
      });

      return activity;

    } catch (error) {
      console.error('❌ [ACTIVITY-CREATE] Erro ao criar atividade de comentário:', {
        error: error.message,
        commentId: comment.id,
        cardId: card.id,
        boardId: board.id,
        action: action,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },
};
