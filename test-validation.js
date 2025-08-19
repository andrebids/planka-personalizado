#!/usr/bin/env node

// Script de teste para validação de parâmetros do List Update
const List = require('./api/models/List.js');

// Função de validação simulada
function validateListUpdate(inputs) {
  console.log('=== TESTE DE VALIDAÇÃO ===');
  console.log('Inputs:', JSON.stringify(inputs, null, 2));
  
  const errors = [];
  
  // Validar ID
  if (!inputs.id) {
    errors.push('ID é obrigatório');
  } else if (typeof inputs.id !== 'string') {
    errors.push('ID deve ser string');
  } else if (!/^[1-9][0-9]*$/.test(inputs.id)) {
    errors.push('ID deve ser número positivo');
  }
  
  // Validar type
  if (inputs.type !== undefined) {
    if (typeof inputs.type !== 'string') {
      errors.push('Type deve ser string');
    } else if (!List.FINITE_TYPES.includes(inputs.type)) {
      errors.push(`Type deve ser um dos valores: ${List.FINITE_TYPES.join(', ')}`);
    }
  }
  
  // Validar position
  if (inputs.position !== undefined) {
    if (typeof inputs.position !== 'number') {
      errors.push('Position deve ser número');
    } else if (inputs.position < 0) {
      errors.push('Position deve ser >= 0');
    }
  }
  
  // Validar name
  if (inputs.name !== undefined) {
    if (typeof inputs.name !== 'string') {
      errors.push('Name deve ser string');
    } else if (inputs.name.trim().length === 0) {
      errors.push('Name não pode ser vazio ou apenas espaços');
    } else if (inputs.name.length > 128) {
      errors.push('Name deve ter no máximo 128 caracteres');
    }
  }
  
  // Validar color
  if (inputs.color !== undefined) {
    if (inputs.color !== null && typeof inputs.color !== 'string') {
      errors.push('Color deve ser string ou null');
    } else if (inputs.color !== null) {
      // Se for string vazia, é inválido
      if (inputs.color === '') {
        errors.push('Color não pode ser string vazia');
      } else {
        // Aceitar cores padrão
        const isValidStandardColor = List.COLORS.includes(inputs.color);
        
        // Aceitar cores personalizadas no formato: nome-cor
        const customColorRegex = /^[a-z]+-[a-z]+$/;
        const isValidCustomColor = customColorRegex.test(inputs.color);
        
        if (!isValidStandardColor && !isValidCustomColor) {
          errors.push(`Color deve ser uma cor padrão (${List.COLORS.join(', ')}) ou uma cor personalizada no formato 'nome-cor'`);
        }
      }
    }
  }
  
  console.log('Erros encontrados:', errors);
  console.log('========================');
  
  return errors;
}

// Testes
console.log('Testando validações...\n');

// Teste 1: Dados válidos
console.log('Teste 1: Dados válidos');
validateListUpdate({
  id: '1580585844777944075',
  name: 'Lista Teste'
});

// Teste 2: Nome vazio
console.log('\nTeste 2: Nome vazio');
validateListUpdate({
  id: '1580585844777944075',
  name: ''
});

// Teste 3: Nome apenas espaços
console.log('\nTeste 3: Nome apenas espaços');
validateListUpdate({
  id: '1580585844777944075',
  name: '   '
});

// Teste 4: Cor inválida
console.log('\nTeste 4: Cor inválida');
validateListUpdate({
  id: '1580585844777944075',
  name: 'Lista Teste',
  color: 'cor-invalida'
});

// Teste 5: Type inválido
console.log('\nTeste 5: Type inválido');
validateListUpdate({
  id: '1580585844777944075',
  name: 'Lista Teste',
  type: 'tipo-invalido'
});

// Teste 6: Cor ravenclaw-blue (agora válida)
console.log('\nTeste 6: Cor ravenclaw-blue (válida)');
validateListUpdate({
  id: '1580585844777944075',
  name: 'Lista Teste',
  color: 'ravenclaw-blue'
});

// Teste 7: Cor personalizada válida
console.log('\nTeste 7: Cor personalizada válida');
validateListUpdate({
  id: '1580585844777944075',
  name: 'Lista Teste',
  color: 'gryffindor-red'
});

// Teste 8: Cor personalizada válida
console.log('\nTeste 8: Cor personalizada válida');
validateListUpdate({
  id: '1580585844777944075',
  name: 'Lista Teste',
  color: 'slytherin-green'
});

// Teste 9: Cor inválida (formato incorreto)
console.log('\nTeste 9: Cor inválida (formato incorreto)');
validateListUpdate({
  id: '1580585844777944075',
  name: 'Lista Teste',
  color: 'cor_invalida'
});
