/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    type: {
      type: 'string',
      isIn: List.FINITE_TYPES,
    },
    position: {
      type: 'number',
      min: 0,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
    },
    color: {
      type: 'string',
      allowNull: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    listNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    // Log temporário para debug
    console.log('=== DEBUG LIST UPDATE ===');
    console.log('Inputs recebidos:', JSON.stringify(inputs, null, 2));
    console.log('Headers:', JSON.stringify(this.req.headers, null, 2));
    console.log('Body:', JSON.stringify(this.req.body, null, 2));
    console.log('========================');

    const { currentUser } = this.req;

    const pathToProject = await sails.helpers.lists
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.LIST_NOT_FOUND);

    let { list } = pathToProject;
    const { board, project } = pathToProject;

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.LIST_NOT_FOUND; // Forbidden
    }

    if (!sails.helpers.lists.isFinite(list)) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.pick(inputs, ['type', 'position', 'name', 'color']);

    // Log temporário para debug de validação
    console.log('=== VALIDAÇÃO DE CAMPOS ===');
    console.log('Values a serem validados:', JSON.stringify(values, null, 2));
    if (values.name !== undefined) {
      console.log('Name length:', values.name ? values.name.length : 'undefined');
      console.log('Name trimmed length:', values.name ? values.name.trim().length : 'undefined');
      console.log('Name is empty string:', values.name === '');
      console.log('Name is only spaces:', values.name && values.name.trim().length === 0);
    }
    if (values.type !== undefined) {
      console.log('Type value:', values.type);
      console.log('Type is valid:', List.FINITE_TYPES.includes(values.type));
    }
    if (values.color !== undefined) {
      console.log('Color value:', values.color);
      console.log('Color is valid:', List.COLORS.includes(values.color));
    }
    console.log('==========================');

    list = await sails.helpers.lists.updateOne.with({
      values,
      project,
      board,
      record: list,
      actorUser: currentUser,
      request: this.req,
    });

    if (!list) {
      throw Errors.LIST_NOT_FOUND;
    }

    return {
      item: list,
    };
  },
};
