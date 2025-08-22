/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
};

module.exports = {
  inputs: {
    cardId: {
      ...idInput,
      required: true,
    },
    text: {
      type: 'string',
      maxLength: 1048576,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    cardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    console.log('🎯 [CONTROLLER-COMMENT] Recebendo requisição para criar comentário:', {
      cardId: inputs.cardId,
      text: inputs.text,
      userId: currentUser.id,
      userName: currentUser.name,
      userAgent: this.req.headers['user-agent'],
      ip: this.req.ip,
      timestamp: new Date().toISOString()
    });

    const { card, list, board, project } = await sails.helpers.cards
      .getPathToProjectById(inputs.cardId)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    console.log('🔍 [CONTROLLER-COMMENT] Contexto do cartão obtido:', {
      cardId: card.id,
      cardName: card.name,
      listId: list.id,
      listName: list.name,
      boardId: board.id,
      boardName: board.name,
      projectId: project.id,
      projectName: project.name
    });

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      if (!boardMembership.canComment) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    const values = _.pick(inputs, ['text']);

    console.log('🚀 [CONTROLLER-COMMENT] Iniciando criação do comentário via helper:', {
      values: values,
      cardId: card.id,
      userId: currentUser.id,
      boardId: board.id
    });

    const comment = await sails.helpers.comments.createOne.with({
      project,
      board,
      list,
      values: {
        ...values,
        card,
        user: currentUser,
      },
      request: this.req,
    });

    console.log('✅ [CONTROLLER-COMMENT] Comentário criado com sucesso:', {
      commentId: comment.id,
      text: comment.text,
      cardId: comment.cardId,
      userId: comment.userId,
      createdAt: comment.createdAt,
      timestamp: new Date().toISOString()
    });

    return {
      item: comment,
    };
  },
};
