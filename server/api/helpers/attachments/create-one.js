/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const Action = require('../../models/Action');
const _ = require('lodash');

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
    requestId: {
      type: 'string',
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values } = inputs;

    const attachment = await sails.models.attachment.qm.createOne({
      ...values,
      cardId: values.card.id,
      creatorUserId: values.creatorUser.id,
    });

    sails.sockets.broadcast(
      `board:${inputs.board.id}`,
      'attachmentCreate',
      {
        item: sails.helpers.attachments.presentOne(attachment),
        requestId: inputs.requestId,
      },
      inputs.request,
    );

    sails.helpers.utils.sendWebhooks.with({
      event: 'attachmentCreate',
      buildData: () => ({
        item: sails.helpers.attachments.presentOne(attachment),
        included: {
          projects: [inputs.project],
          boards: [inputs.board],
          lists: [inputs.list],
          cards: [values.card],
        },
      }),
      user: values.creatorUser,
    });

    // Criar ação para criação de anexo
    await sails.helpers.actions.createOne.with({
      values: {
        type: Action.Types.CREATE_ATTACHMENT,
        data: {
          card: _.pick(values.card, ['name']),
          attachment: _.pick(attachment, ['id', 'name']),
        },
        user: values.creatorUser,
        card: values.card,
      },
      project: inputs.project,
      board: inputs.board,
      list: inputs.list,
    });

    if (!values.card.coverAttachmentId) {
      if (attachment.type === sails.models.attachment.Types.FILE && attachment.data.image) {
        await sails.helpers.cards.updateOne.with({
          record: values.card,
          values: {
            coverAttachmentId: attachment.id,
          },
          project: inputs.project,
          board: inputs.board,
          list: inputs.list,
          actorUser: values.creatorUser,
        });
      }
    }

    return attachment;
  },
};
