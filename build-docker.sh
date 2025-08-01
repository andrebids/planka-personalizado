#!/bin/bash

echo "🚀 Iniciando build do Planka para Docker..."

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Verificar se estamos no diretório correto
if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile não encontrado. Certifique-se de estar no diretório raiz do projeto."
    exit 1
fi

echo "📦 Fazendo build da imagem Docker..."
docker build -t planka:latest .

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    echo ""
    echo "🎯 Para executar o Planka:"
    echo "   docker-compose up -d"
    echo ""
    echo "🌐 Acesse: http://localhost:3000"
    echo "👤 Admin: admin@example.com / admin123"
else
    echo "❌ Erro no build. Verifique os logs acima."
    exit 1
fi 