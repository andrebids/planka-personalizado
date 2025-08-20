/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * query-methods hook
 *
 * @description :: A hook definition. Extends Sails by adding shadow routes, implicit actions,
 *                 and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

const fs = require('fs');
const path = require('path');

module.exports = function defineQueryMethodsHook(sails) {
  const addQueryMethods = () => {
    // Verificar se os modelos estão disponíveis
    if (!sails.models || Object.keys(sails.models).length === 0) {
      sails.log.warn('⚠ No models available yet, retrying in 1 second...');
      setTimeout(addQueryMethods, 1000);
      return;
    }

    const queryMethodsByModelName = fs.readdirSync(path.join(__dirname, 'models')).reduce(
      (result, filename) => {
        const parsedName = path.parse(filename).name;
        const queryMethods = require(path.join(__dirname, 'models', filename));
        
        return {
          ...result,
          [parsedName]: queryMethods,
        };
      },
      {},
    );

    _(sails.models).forEach((Model) => {
      const queryMethods = queryMethodsByModelName[Model.identity];

      if (queryMethods) {
        Object.assign(Model, {
          qm: queryMethods,
        });
      } else {
        // Tentar mapeamento case-insensitive
        const lowerCaseKeys = Object.keys(queryMethodsByModelName).map(key => key.toLowerCase());
        const lowerCaseIdentity = Model.identity.toLowerCase();
        
        if (lowerCaseKeys.includes(lowerCaseIdentity)) {
          const originalKey = Object.keys(queryMethodsByModelName).find(key => key.toLowerCase() === lowerCaseIdentity);
          const queryMethods = queryMethodsByModelName[originalKey];
          
          Object.assign(Model, {
            qm: queryMethods,
          });
        }
      }
    });
    
    sails.log.info('✓ Query methods hook completed successfully');
  };

  return {
    /**
     * Runs when this Sails app loads/lifts.
     */
    initialize() {
      sails.log.info('Initializing custom hook (`query-methods`)');

      // Garantir que o ORM esteja carregado antes de adicionar query methods
      sails.after('hook:orm:loaded', () => {
        addQueryMethods();
      });
    },
  };
};
