@echo off
echo 🚀 Configurador de Ambiente do Planka
echo.

echo Escolha o ambiente:
echo 1. Local (localhost)
echo 2. Desenvolvimento (IP específico)
echo 3. Produção (IP específico)
echo 4. Personalizado
echo.

set /p choice="Digite sua escolha (1-4): "

if "%choice%"=="1" (
    echo Configurando ambiente LOCAL...
    echo BASE_URL=http://localhost:3000 > .env
    echo SECRET_KEY=notsecretkey >> .env
    echo DATABASE_URL=postgresql://postgres@postgres/planka >> .env
    echo DEFAULT_ADMIN_EMAIL=admin@example.com >> .env
    echo DEFAULT_ADMIN_PASSWORD=admin123 >> .env
    echo ✅ Ambiente LOCAL configurado!
)

if "%choice%"=="2" (
    set /p dev_ip="Digite o IP do servidor de desenvolvimento: "
    echo Configurando ambiente DESENVOLVIMENTO...
    echo BASE_URL=http://%dev_ip%:3000 > .env
    echo SECRET_KEY=dev_secret_key_%random% >> .env
    echo DATABASE_URL=postgresql://postgres@postgres/planka >> .env
    echo DEFAULT_ADMIN_EMAIL=admin@example.com >> .env
    echo DEFAULT_ADMIN_PASSWORD=admin123 >> .env
    echo ✅ Ambiente DESENVOLVIMENTO configurado para %dev_ip%!
)

if "%choice%"=="3" (
    set /p prod_ip="Digite o IP do servidor de produção: "
    echo Configurando ambiente PRODUÇÃO...
    echo BASE_URL=http://%prod_ip%:3000 > .env
    echo SECRET_KEY=prod_secret_key_%random% >> .env
    echo DATABASE_URL=postgresql://postgres@postgres/planka >> .env
    echo DEFAULT_ADMIN_EMAIL=admin@example.com >> .env
    echo DEFAULT_ADMIN_PASSWORD=admin123 >> .env
    echo LOG_LEVEL=warn >> .env
    echo ✅ Ambiente PRODUÇÃO configurado para %prod_ip%!
)

if "%choice%"=="4" (
    set /p custom_url="Digite a URL completa (ex: http://meuservidor.com): "
    set /p custom_secret="Digite a chave secreta: "
    echo Configurando ambiente PERSONALIZADO...
    echo BASE_URL=%custom_url% > .env
    echo SECRET_KEY=%custom_secret% >> .env
    echo DATABASE_URL=postgresql://postgres@postgres/planka >> .env
    echo DEFAULT_ADMIN_EMAIL=admin@example.com >> .env
    echo DEFAULT_ADMIN_PASSWORD=admin123 >> .env
    echo ✅ Ambiente PERSONALIZADO configurado!
)

echo.
echo 📝 Configuração atual:
type .env
echo.
echo 🎯 Próximos passos:
echo    1. Para build local: .\build-local.bat
echo    2. Para build Docker: .\build-docker.bat
echo    3. Para executar: .\start-planka.bat
echo.

pause
