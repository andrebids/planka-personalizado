@echo off
echo 🚀 Iniciando build do Planka para Docker...

REM Verificar se o Docker está rodando
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker não está rodando. Por favor, inicie o Docker primeiro.
    pause
    exit /b 1
)

REM Verificar se estamos no diretório correto
if not exist "Dockerfile" (
    echo ❌ Dockerfile não encontrado. Certifique-se de estar no diretório raiz do projeto.
    pause
    exit /b 1
)

echo 📦 Fazendo build da imagem Docker...
docker build -t planka:latest .

if errorlevel 0 (
    echo ✅ Build concluído com sucesso!
    echo.
    echo 🎯 Para executar o Planka:
    echo    docker-compose up -d
    echo.
    echo 🌐 Acesse: http://localhost:3000
    echo 👤 Admin: admin@example.com / admin123
) else (
    echo ❌ Erro no build. Verifique os logs acima.
    pause
    exit /b 1
)

pause 