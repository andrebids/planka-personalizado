@echo off
echo 🚀 Iniciando build local do Planka (sem Docker)...
echo.

REM Verificar se estamos no diretório correto
if not exist "package.json" (
    echo ❌ package.json não encontrado. Certifique-se de estar no diretório raiz do projeto.
    pause
    exit /b 1
)

if not exist "client\package.json" (
    echo ❌ package.json do cliente não encontrado.
    pause
    exit /b 1
)

if not exist "server\package.json" (
    echo ❌ package.json do servidor não encontrado.
    pause
    exit /b 1
)

echo 📦 Instalando dependências do projeto principal (sem postinstall)...
call npm install --ignore-scripts
if errorlevel 1 (
    echo ❌ Erro ao instalar dependências do projeto principal
    pause
    exit /b 1
)

echo 📦 Instalando dependências do cliente...
cd client
call npm install --ignore-scripts
if errorlevel 1 (
    echo ❌ Erro ao instalar dependências do cliente
    cd ..
    pause
    exit /b 1
)
cd ..

echo 📦 Instalando dependências do servidor (sem setup-python)...
cd server
call npm install --ignore-scripts
if errorlevel 1 (
    echo ❌ Erro ao instalar dependências do servidor
    cd ..
    pause
    exit /b 1
)
cd ..

echo ✅ Build local concluído com sucesso!
echo.
echo 🎯 Para executar o Planka em modo desenvolvimento:
echo    npm start
echo.
echo 🌐 O cliente estará disponível em: http://localhost:3000
echo 🔧 O servidor estará disponível em: http://localhost:1337
echo 👤 Admin: admin@example.com / admin123
echo.
echo ⚠️ Nota: Algumas funcionalidades Python podem não estar disponíveis
echo.
echo 🐳 Para build com Docker, use: build-docker.bat
echo.

pause
