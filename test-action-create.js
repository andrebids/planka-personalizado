// Script para testar se o modelo Action está funcionando corretamente
console.log('🎯 Testando criação de Action no ambiente Sails...');

try {
  // Simular ambiente Sails básico
  global.sails = {
    log: {
      info: console.log,
      error: console.error,
      debug: console.log
    },
    models: {
      action: {
        create: function(data) {
          console.log('✅ Action.create chamado com:', data);
          // Simular erro para testar
          if (data.type === 'createAttachment') {
            console.log('❌ Simulando erro para createAttachment');
            return Promise.reject(new Error('Erro simulado para teste'));
          }
          return Promise.resolve({
            id: 123,
            type: data.type,
            data: data.data,
            boardId: data.boardId,
            cardId: data.cardId,
            userId: data.userId
          });
        }
      }
    },
    sockets: {
      broadcast: function(channel, event, data, request) {
        console.log('✅ Socket broadcast:', { channel, event, data });
      }
    }
  };

  // Carregar o helper
  var helper = require('./server/api/helpers/activities/create-attachment-activity');
  console.log('✅ Helper carregado com sucesso');

  // Testar dados
  var testInputs = {
    attachment: {
      id: 1,
      name: 'video-teste.mp4',
      data: {
        mimeType: 'video/mp4',
        video: {
          duration: 15.5,
          width: 1920,
          height: 1080,
          format: 'mp4'
        },
        thumbnailUrls: {
          outside360: '/uploads/thumbnails/video-teste-360.jpg',
          outside720: '/uploads/thumbnails/video-teste-720.jpg'
        }
      }
    },
    card: {
      id: 1,
      name: 'Cartão de Teste'
    },
    user: {
      id: 1,
      name: 'Utilizador Teste'
    },
    board: {
      id: 1,
      name: 'Quadro de Teste'
    },
    action: 'create'
  };

  // Executar o helper
  helper.fn(testInputs).then(function(result) {
    console.log('✅ Helper executado com sucesso:', result);
  }).catch(function(error) {
    console.error('❌ Erro ao executar helper:', error.message);
    console.error('Stack:', error.stack);
  });

} catch (error) {
  console.error('❌ Erro no teste:', error.message);
  console.error('Stack:', error.stack);
}
