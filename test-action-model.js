console.log('🎯 Testando modelo Action...');

try {
  const Action = require('./server/api/models/Action');
  console.log('✅ Action model carregado:', typeof Action);
  console.log('✅ Action.create:', typeof Action.create);
  console.log('✅ Action identity:', Action.identity);
  console.log('✅ Action globalId:', Action.globalId);
  console.log('✅ Action attributes:', Object.keys(Action.attributes || {}));
  console.log('✅ Action Types:', Action.Types);
} catch (error) {
  console.error('❌ Erro ao carregar modelo Action:', error.message);
  console.error('Stack:', error.stack);
}
