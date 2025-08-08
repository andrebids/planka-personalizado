@echo off
REM Script para deploy do Planka no servidor (Windows)
REM Este script configura o BASE_URL corretamente para o servidor

echo 🚀 Iniciando deploy do Planka no servidor...

REM Configurar variável de ambiente para o servidor
set PLANKA_BASE_URL=http://104.197.195.116:3000

echo 📋 Configuração:
echo    BASE_URL: %PLANKA_BASE_URL%

REM Parar containers existentes
echo 🛑 Parando containers existentes...
docker-compose down

REM Iniciar com nova configuração
echo ▶️  Iniciando containers com nova configuração...
docker-compose up -d

REM Aguardar inicialização
echo ⏳ Aguardando inicialização...
timeout /t 30 /nobreak >nul

REM Verificar status
echo 📊 Status dos containers:
docker ps --format "table {{.Names}}\t{{.Status}}" | findstr planka

echo ✅ Deploy concluído!
echo 🌐 Acesse: http://104.197.195.116:3000
echo 👤 Login: admin@example.com / admin123

pause
