#!/bin/bash

echo "🎯 Iniciando Planka..."

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Verificar se a imagem existe
if ! docker image inspect planka:latest > /dev/null 2>&1; then
    echo "📦 Imagem não encontrada. Fazendo build primeiro..."
    ./build-docker.sh
fi

echo "🚀 Iniciando serviços com Docker Compose..."
docker-compose -f docker-compose-local.yml up -d

if [ $? -eq 0 ]; then
    echo "✅ Planka iniciado com sucesso!"
    echo ""
    echo "🌐 Acesse: http://localhost:3000"
    echo "👤 Admin: admin@example.com / admin123"
    echo ""
    echo "📊 Para ver os logs:"
    echo "   docker-compose -f docker-compose-local.yml logs -f"
    echo ""
    echo "🛑 Para parar:"
    echo "   docker-compose -f docker-compose-local.yml down"
else
    echo "❌ Erro ao iniciar. Verifique os logs acima."
    exit 1
fi 