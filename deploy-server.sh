#!/bin/bash

# Script para deploy do Planka no servidor
# Este script configura o BASE_URL corretamente para o servidor

echo "🚀 Iniciando deploy do Planka no servidor..."

# Configurar variável de ambiente para o servidor
export PLANKA_BASE_URL=http://104.197.195.116:3000

echo "📋 Configuração:"
echo "   BASE_URL: $PLANKA_BASE_URL"

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Iniciar com nova configuração
echo "▶️  Iniciando containers com nova configuração..."
docker-compose up -d

# Aguardar inicialização
echo "⏳ Aguardando inicialização..."
sleep 30

# Verificar status
echo "📊 Status dos containers:"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep planka

echo "✅ Deploy concluído!"
echo "🌐 Acesse: http://104.197.195.116:3000"
echo "👤 Login: admin@example.com / admin123"
