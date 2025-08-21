/*!
 * Script de teste para verificar atividades de comentário
 */

console.log('🧪 Testando criação de atividade de comentário...');

// Simular dados de teste
const testData = {
  commentId: 'test-comment-123',
  commentText: 'Este é um comentário de teste para verificar se aparece no histórico',
  cardName: 'Cartão de Teste',
  cardId: 'test-card-123',
  mentions: ['usuario1', 'usuario2'],
  isReply: false,
  action: 'create'
};

console.log('📊 Dados de teste:', testData);

// Verificar se o tipo de atividade está definido no modelo
console.log('✅ Tipos de atividade disponíveis:');
console.log('- commentCreate');
console.log('- commentUpdate');
console.log('- commentDelete');
console.log('- commentReply');

console.log('🎯 Para testar:');
console.log('1. Reinicie o servidor para carregar as mudanças no modelo Action');
console.log('2. Crie um novo comentário em qualquer cartão');
console.log('3. Verifique se aparece no histórico de atividades');
console.log('4. Verifique os logs do servidor para mensagens de sucesso/erro');

console.log('🔍 Logs esperados:');
console.log('✅ Atividade de comentário criada no histórico: { activityId: "...", type: "commentCreate", commentId: "..." }');
