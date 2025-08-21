/*!
 * Script para testar atividades de comentário no banco de dados
 */

console.log('🔍 Verificando atividades de comentário no banco de dados...');

// Simular uma query para verificar atividades
const testQuery = `
// Query para verificar atividades de comentário
db.actions.find({
  type: { 
    $in: ['commentCreate', 'commentUpdate', 'commentDelete', 'commentReply'] 
  }
}).sort({createdAt: -1}).limit(5)
`;

console.log('📊 Query de teste:');
console.log(testQuery);

console.log('🎯 Para verificar manualmente:');
console.log('1. Acesse o banco de dados (MongoDB/PostgreSQL)');
console.log('2. Execute a query acima');
console.log('3. Verifique se as atividades de comentário existem');

console.log('🔍 Verificações adicionais:');
console.log('- Verificar se o tipo "commentCreate" está na tabela/coleção');
console.log('- Verificar se os dados estão corretos');
console.log('- Verificar se o frontend está carregando as atividades');

console.log('📋 Logs esperados no servidor:');
console.log('✅ Atividade de comentário criada no histórico: { activityId: "...", type: "commentCreate", commentId: "..." }');
