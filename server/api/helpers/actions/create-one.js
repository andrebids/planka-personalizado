/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const escapeMarkdown = require('escape-markdown');
const escapeHtml = require('escape-html');

const buildTitle = (action, t) => {
  switch (action.type) {
    case Action.Types.CREATE_CARD:
      return t('Card Created');
    case Action.Types.MOVE_CARD:
      return t('Card Moved');
    case Action.Types.CREATE_TASK:
      return t('Task Created');
    case Action.Types.DELETE_TASK:
      return t('Task Deleted');
    case Action.Types.UPDATE_TASK:
      return t('Task Updated');
    case Action.Types.COMPLETE_TASK:
      return t('Task Completed');
    case Action.Types.UNCOMPLETE_TASK:
      return t('Task Marked Incomplete');
    case Action.Types.CREATE_TASK_LIST:
      return t('Task List Created');
    case Action.Types.DELETE_TASK_LIST:
      return t('Task List Deleted');
    case Action.Types.CREATE_ATTACHMENT:
      return t('Attachment Created');
    case Action.Types.DELETE_ATTACHMENT:
      return t('Attachment Deleted');
    case Action.Types.SET_DUE_DATE:
      return t('Due Date Set');
    default:
      return null;
  }
};

const buildBodyByFormat = (board, card, action, actorUser, t) => {
  const markdownCardLink = `[${escapeMarkdown(card.name)}](${sails.config.custom.baseUrl}/cards/${card.id})`;
  const htmlCardLink = `<a href="${sails.config.custom.baseUrl}/cards/${card.id}">${escapeHtml(card.name)}</a>`;

  switch (action.type) {
    case Action.Types.CREATE_CARD: {
      const listName = sails.helpers.lists.makeName(action.data.list);

      return {
        text: t('%s created %s in %s on %s', actorUser.name, card.name, listName, board.name),
        markdown: t(
          '%s created %s in %s on %s',
          escapeMarkdown(actorUser.name),
          markdownCardLink,
          `**${escapeMarkdown(listName)}**`,
          escapeMarkdown(board.name),
        ),
        html: t(
          '%s created %s in %s on %s',
          escapeHtml(actorUser.name),
          htmlCardLink,
          `<b>${escapeHtml(listName)}</b>`,
          escapeHtml(board.name),
        ),
      };
    }
    case Action.Types.MOVE_CARD: {
      const fromListName = sails.helpers.lists.makeName(action.data.fromList);
      const toListName = sails.helpers.lists.makeName(action.data.toList);

      return {
        text: t(
          '%s moved %s from %s to %s on %s',
          actorUser.name,
          card.name,
          fromListName,
          toListName,
          board.name,
        ),
        markdown: t(
          '%s moved %s from %s to %s on %s',
          escapeMarkdown(actorUser.name),
          markdownCardLink,
          `**${escapeMarkdown(fromListName)}**`,
          `**${escapeMarkdown(toListName)}**`,
          escapeMarkdown(board.name),
        ),
        html: t(
          '%s moved %s from %s to %s on %s',
          escapeHtml(actorUser.name),
          htmlCardLink,
          `<b>${escapeHtml(fromListName)}</b>`,
          `<b>${escapeHtml(toListName)}</b>`,
          escapeHtml(board.name),
        ),
      };
    }
    case Action.Types.SET_DUE_DATE: {
      const formatDate = (date) => {
        if (!date) return t('No date');
        return new Date(date).toLocaleDateString();
      };

      const oldDate = formatDate(action.data.oldDueDate);
      const newDate = formatDate(action.data.newDueDate);

      if (!action.data.oldDueDate && action.data.newDueDate) {
        // Data de vencimento adicionada
        return {
          text: t('%s set due date to %s for %s on %s', actorUser.name, newDate, card.name, board.name),
          markdown: t(
            '%s set due date to %s for %s on %s',
            escapeMarkdown(actorUser.name),
            `**${escapeMarkdown(newDate)}**`,
            markdownCardLink,
            escapeMarkdown(board.name),
          ),
          html: t(
            '%s set due date to %s for %s on %s',
            escapeHtml(actorUser.name),
            `<b>${escapeHtml(newDate)}</b>`,
            htmlCardLink,
            escapeHtml(board.name),
          ),
        };
      } else if (action.data.oldDueDate && !action.data.newDueDate) {
        // Data de vencimento removida
        return {
          text: t('%s removed due date from %s on %s', actorUser.name, card.name, board.name),
          markdown: t(
            '%s removed due date from %s on %s',
            escapeMarkdown(actorUser.name),
            markdownCardLink,
            escapeMarkdown(board.name),
          ),
          html: t(
            '%s removed due date from %s on %s',
            escapeHtml(actorUser.name),
            htmlCardLink,
            escapeHtml(board.name),
          ),
        };
      } else {
        // Data de vencimento alterada
        return {
          text: t('%s changed due date from %s to %s for %s on %s', actorUser.name, oldDate, newDate, card.name, board.name),
          markdown: t(
            '%s changed due date from %s to %s for %s on %s',
            escapeMarkdown(actorUser.name),
            `**${escapeMarkdown(oldDate)}**`,
            `**${escapeMarkdown(newDate)}**`,
            markdownCardLink,
            escapeMarkdown(board.name),
          ),
          html: t(
            '%s changed due date from %s to %s for %s on %s',
            escapeHtml(actorUser.name),
            `<b>${escapeHtml(oldDate)}</b>`,
            `<b>${escapeHtml(newDate)}</b>`,
            htmlCardLink,
            escapeHtml(board.name),
          ),
        };
      }
    }
    case Action.Types.CREATE_TASK: {
      const taskName = action.data.task.name;

      return {
        text: t('%s created task %s in %s on %s', actorUser.name, taskName, card.name, board.name),
        markdown: t(
          '%s created task %s in %s on %s',
          escapeMarkdown(actorUser.name),
          `**${escapeMarkdown(taskName)}**`,
          markdownCardLink,
          escapeMarkdown(board.name),
        ),
        html: t(
          '%s created task %s in %s on %s',
          escapeHtml(actorUser.name),
          `<b>${escapeHtml(taskName)}</b>`,
          htmlCardLink,
          escapeHtml(board.name),
        ),
      };
    }
    case Action.Types.DELETE_TASK: {
      const taskName = action.data.task.name;

      return {
        text: t('%s deleted task %s from %s on %s', actorUser.name, taskName, card.name, board.name),
        markdown: t(
          '%s deleted task %s from %s on %s',
          escapeMarkdown(actorUser.name),
          `**${escapeMarkdown(taskName)}**`,
          markdownCardLink,
          escapeMarkdown(board.name),
        ),
        html: t(
          '%s deleted task %s from %s on %s',
          escapeHtml(actorUser.name),
          `<b>${escapeHtml(taskName)}</b>`,
          htmlCardLink,
          escapeHtml(board.name),
        ),
      };
    }
    case Action.Types.UPDATE_TASK: {
      const taskName = action.data.task.name;

      return {
        text: t('%s updated task %s in %s on %s', actorUser.name, taskName, card.name, board.name),
        markdown: t(
          '%s updated task %s in %s on %s',
          escapeMarkdown(actorUser.name),
          `**${escapeMarkdown(taskName)}**`,
          markdownCardLink,
          escapeMarkdown(board.name),
        ),
        html: t(
          '%s updated task %s in %s on %s',
          escapeHtml(actorUser.name),
          `<b>${escapeHtml(taskName)}</b>`,
          htmlCardLink,
          escapeHtml(board.name),
        ),
      };
    }
    case Action.Types.COMPLETE_TASK: {
      const taskName = action.data.task.name;

      return {
        text: t('%s completed task %s in %s on %s', actorUser.name, taskName, card.name, board.name),
        markdown: t(
          '%s completed task %s in %s on %s',
          escapeMarkdown(actorUser.name),
          `**${escapeMarkdown(taskName)}**`,
          markdownCardLink,
          escapeMarkdown(board.name),
        ),
        html: t(
          '%s completed task %s in %s on %s',
          escapeHtml(actorUser.name),
          `<b>${escapeHtml(taskName)}</b>`,
          htmlCardLink,
          escapeHtml(board.name),
        ),
      };
    }
    case Action.Types.UNCOMPLETE_TASK: {
      const taskName = action.data.task.name;

      return {
        text: t('%s marked task %s incomplete in %s on %s', actorUser.name, taskName, card.name, board.name),
        markdown: t(
          '%s marked task %s incomplete in %s on %s',
          escapeMarkdown(actorUser.name),
          `**${escapeMarkdown(taskName)}**`,
          markdownCardLink,
          escapeMarkdown(board.name),
        ),
        html: t(
          '%s marked task %s incomplete in %s on %s',
          escapeHtml(actorUser.name),
          `<b>${escapeHtml(taskName)}</b>`,
          htmlCardLink,
          escapeHtml(board.name),
        ),
      };
    }
    case Action.Types.CREATE_TASK_LIST: {
      const taskListName = action.data.taskList.name;

      return {
        text: t('%s created task list %s in %s on %s', actorUser.name, taskListName, card.name, board.name),
        markdown: t(
          '%s created task list %s in %s on %s',
          escapeMarkdown(actorUser.name),
          `**${escapeMarkdown(taskListName)}**`,
          markdownCardLink,
          escapeMarkdown(board.name),
        ),
        html: t(
          '%s created task list %s in %s on %s',
          escapeHtml(actorUser.name),
          `<b>${escapeHtml(taskListName)}</b>`,
          htmlCardLink,
          escapeHtml(board.name),
        ),
      };
    }
    case Action.Types.DELETE_TASK_LIST: {
      const taskListName = action.data.taskList.name;

      return {
        text: t('%s deleted task list %s from %s on %s', actorUser.name, taskListName, card.name, board.name),
        markdown: t(
          '%s deleted task list %s from %s on %s',
          escapeMarkdown(actorUser.name),
          `**${escapeMarkdown(taskListName)}**`,
          markdownCardLink,
          escapeMarkdown(board.name),
        ),
        html: t(
          '%s deleted task list %s from %s on %s',
          escapeHtml(actorUser.name),
          `<b>${escapeHtml(taskListName)}</b>`,
          htmlCardLink,
          escapeHtml(board.name),
        ),
      };
    }
    case Action.Types.CREATE_ATTACHMENT: {
      const attachmentName = action.data.attachment.name;

      return {
        text: t('%s created attachment %s in %s on %s', actorUser.name, attachmentName, card.name, board.name),
        markdown: t(
          '%s created attachment %s in %s on %s',
          escapeMarkdown(actorUser.name),
          `**${escapeMarkdown(attachmentName)}**`,
          markdownCardLink,
          escapeMarkdown(board.name),
        ),
        html: t(
          '%s created attachment %s in %s on %s',
          escapeHtml(actorUser.name),
          `<b>${escapeHtml(attachmentName)}</b>`,
          htmlCardLink,
          escapeHtml(board.name),
        ),
      };
    }
    case Action.Types.DELETE_ATTACHMENT: {
      const attachmentName = action.data.attachment.name;

      return {
        text: t('%s deleted attachment %s from %s on %s', actorUser.name, attachmentName, card.name, board.name),
        markdown: t(
          '%s deleted attachment %s from %s on %s',
          escapeMarkdown(actorUser.name),
          `**${escapeMarkdown(attachmentName)}**`,
          markdownCardLink,
          escapeMarkdown(board.name),
        ),
        html: t(
          '%s deleted attachment %s from %s on %s',
          escapeHtml(actorUser.name),
          `<b>${escapeHtml(attachmentName)}</b>`,
          htmlCardLink,
          escapeHtml(board.name),
        ),
      };
    }
    default:
      return null;
  }
};

const buildAndSendNotifications = async (services, board, card, action, actorUser, t) => {
  await sails.helpers.utils.sendNotifications(
    services,
    buildTitle(action, t),
    buildBodyByFormat(board, card, action, actorUser, t),
  );
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

    const action = await Action.qm.createOne({
      ...values,
      boardId: values.card.boardId,
      cardId: values.card.id,
      userId: values.user.id,
    });

    sails.sockets.broadcast(
      `board:${inputs.board.id}`,
      'actionCreate',
      {
        item: action,
      },
      inputs.request,
    );

    sails.helpers.utils.sendWebhooks.with({
      event: 'actionCreate',
      buildData: () => ({
        item: action,
        included: {
          projects: [inputs.project],
          boards: [inputs.board],
          lists: [inputs.list],
          cards: [values.card],
        },
      }),
      user: values.user,
    });

    if (Action.INTERNAL_NOTIFIABLE_TYPES.includes(action.type)) {
      if (Action.PERSONAL_NOTIFIABLE_TYPES.includes(action.type)) {
        if (values.user.id !== action.data.user.id) {
          await sails.helpers.notifications.createOne.with({
            values: {
              action,
              type: action.type,
              data: action.data,
              userId: action.data.user.id,
              creatorUser: values.user,
              card: values.card,
            },
            project: inputs.project,
            board: inputs.board,
            list: inputs.list,
          });
        }
      } else {
        const cardSubscriptionUserIds = await sails.helpers.cards.getSubscriptionUserIds(
          action.cardId,
          action.userId,
        );

        const boardSubscriptionUserIds = await sails.helpers.boards.getSubscriptionUserIds(
          inputs.board.id,
          action.userId,
        );

        const notifiableUserIds = _.union(cardSubscriptionUserIds, boardSubscriptionUserIds);

        await Promise.all(
          notifiableUserIds.map((userId) =>
            sails.helpers.notifications.createOne.with({
              values: {
                userId,
                action,
                type: action.type,
                data: action.data,
                creatorUser: values.user,
                card: values.card,
              },
              project: inputs.project,
              board: inputs.board,
              list: inputs.list,
            }),
          ),
        );
      }
    }

    if (Action.EXTERNAL_NOTIFIABLE_TYPES.includes(action.type)) {
      const notificationServices = await NotificationService.qm.getByBoardId(inputs.board.id);

      if (notificationServices.length > 0) {
        const services = notificationServices.map((notificationService) =>
          _.pick(notificationService, ['url', 'format']),
        );

        buildAndSendNotifications(
          services,
          inputs.board,
          values.card,
          action,
          values.user,
          sails.helpers.utils.makeTranslator(),
        );
      }
    }

    return action;
  },
};
