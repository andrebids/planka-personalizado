#!/usr/bin/env node

// Script para limpar logs de debug após resolução do problema
const fs = require('fs');
const path = require('path');

console.log('=== LIMPEZA DE LOGS DE DEBUG ===');

// Arquivo do controlador
const controllerPath = './server/api/controllers/lists/update.js';

try {
  // Ler o arquivo
  let content = fs.readFileSync(controllerPath, 'utf8');
  
  // Remover logs de debug
  const debugPatterns = [
    // Remover logs de debug de inputs
    /\/\/ Log temporário para debug[\s\S]*?console\.log\('========================'\);/g,
    // Remover logs de validação
    /\/\/ Log temporário para debug de validação[\s\S]*?console\.log\('=========================='\);/g
  ];
  
  let originalContent = content;
  
  debugPatterns.forEach((pattern, index) => {
    content = content.replace(pattern, '');
  });
  
  // Verificar se houve mudanças
  if (content !== originalContent) {
    fs.writeFileSync(controllerPath, content, 'utf8');
    console.log('✅ Logs de debug removidos do controlador');
  } else {
    console.log('ℹ️  Nenhum log de debug encontrado para remover');
  }
  
} catch (error) {
  console.error('❌ Erro ao limpar logs:', error.message);
}

// Remover arquivos de teste
const testFiles = [
  './test-validation.js',
  './DOCUMENTACAO_ERRO_VALIDACAO.md',
  './limpar-debug.js'
];

testFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`✅ Arquivo removido: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao remover ${file}:`, error.message);
  }
});

console.log('=== LIMPEZA CONCLUÍDA ===');
console.log('Lembre-se de:');
console.log('1. Testar a funcionalidade após a limpeza');
console.log('2. Documentar a solução final');
console.log('3. Implementar testes automatizados se necessário');
