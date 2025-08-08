@echo off
echo 🎯 Iniciando Planka...

REM Verificar se o Docker está rodando
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker não está rodando. Por favor, inicie o Docker primeiro.
    pause
    exit /b 1
)

REM Verificar se a imagem existe
docker image inspect planka:latest >nul 2>&1
if errorlevel 1 (
    echo 📦 Imagem não encontrada. Fazendo build primeiro...
    call build-docker.bat
)

echo 🚀 Iniciando serviços com Docker Compose...
docker-compose -f docker-compose-local.yml up -d

if errorlevel 0 (
    echo ✅ Planka iniciado com sucesso!
    echo.
    echo 🌐 Acesse: http://localhost:3001
    echo 👤 Admin: admin@example.com / admin123
    echo.
    echo 📊 Para ver os logs:
    echo    docker-compose -f docker-compose-local.yml logs -f
    echo.
    echo 🛑 Para parar:
    echo    docker-compose -f docker-compose-local.yml down
) else (
    echo ❌ Erro ao iniciar. Verifique os logs acima.
    pause
    exit /b 1
)

pause 