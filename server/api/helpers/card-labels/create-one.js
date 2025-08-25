/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

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
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    labelAlreadyInCard: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    let cardLabel;
    try {
      cardLabel = await CardLabel.qm.createOne({
        ...values,
        cardId: values.card.id,
        labelId: values.label.id,
      });
    } catch (error) {
      if (error.code === 'E_UNIQUE') {
        throw 'labelAlreadyInCard';
      }

      throw error;
    }

    sails.sockets.broadcast(
      `board:${inputs.board.id}`,
      'cardLabelCreate',
      {
        item: cardLabel,
      },
      inputs.request,
    );

    sails.helpers.utils.sendWebhooks.with({
      event: 'cardLabelCreate',
      buildData: () => ({
        item: cardLabel,
        included: {
          projects: [inputs.project],
          boards: [inputs.board],
          labels: [values.label],
          lists: [inputs.list],
          cards: [values.card],
        },
      }),
      user: inputs.actorUser,
    });

    // Criar atividade para adição de label
    try {
      await sails.helpers.actions.createOne.with({
        values: {
          type: 'addLabelToCard',
          data: {
            labelId: values.label.id,
            labelName: values.label.name,
            labelColor: values.label.color,
            cardId: values.card.id,
            cardName: values.card.name,
          },
          user: inputs.actorUser,
          card: values.card,
        },
        project: inputs.project,
        board: inputs.board,
        list: inputs.list,
      });
    } catch (activityError) {
      console.error('❌ [HELPER-CARD-LABELS] Erro ao criar atividade:', activityError.message);
      // Não deixar o erro parar o processo
    }

    return cardLabel;
  },
};
