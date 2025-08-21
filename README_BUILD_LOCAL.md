# Build Local do Planka Personalizado

Este documento explica como fazer o build local do Planka com as suas alterações personalizadas.

## 📋 Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **npm** (incluído com Node.js)
- **Git** (para clonar o repositório)
- **Docker** (opcional, para build completo)

## 🚀 Scripts de Build Disponíveis

### 1. Build Local (sem Docker)
```bash
build-local.bat
```
- Instala todas as dependências
- Prepara o ambiente para desenvolvimento
- **Não faz build de produção** (mantém hot reload)
- Pula configuração Python problemática no Windows

### 2. Build Docker (recomendado)
```bash
build-docker.bat
```
- Faz build completo com Docker
- Cria imagem Docker otimizada
- **Inclui todas as suas alterações** nos arquivos
- Requer Docker instalado

### 3. Configurar Ambiente
```bash
configure-env.bat
```
- Configura o ambiente para diferentes servidores
- Suporta local, desenvolvimento, produção e personalizado
- Define BASE_URL, SECRET_KEY e outras variáveis

## 🎯 Scripts de Execução

### 1. Executar com Docker (recomendado)
```bash
start-planka.bat
```
- Inicia Planka usando Docker Compose
- Cliente: http://localhost:3000
- Servidor: http://localhost:1337

### 2. Executar localmente (após build-local.bat)
```bash
npm start
```
- Inicia cliente e servidor em modo desenvolvimento
- Hot reload ativo
- Cliente: http://localhost:3000
- Servidor: http://localhost:1337

## 📝 Passo a Passo

### Para Desenvolvimento Local:
1. Execute `build-local.bat`
2. Execute `npm start`
3. Acesse http://localhost:3000

### Para Docker (recomendado):
1. Execute `configure-env.bat` (escolha o ambiente)
2. Execute `build-docker.bat`
3. Execute `start-planka.bat`
4. Acesse a URL configurada

## 🔧 Configuração de Ambientes

### O Docker inclui suas alterações?
**SIM!** O Dockerfile copia todos os arquivos do projeto, incluindo suas alterações:

```dockerfile
COPY client .                    # Copia cliente com suas alterações
COPY --chown=node:node server ./ # Copia servidor com suas alterações
```

### Configuração para diferentes servidores:

1. **Local**: `http://localhost:3000`
2. **Desenvolvimento**: `http://192.168.1.100:3000`
3. **Produção**: `http://meuservidor.com:3000`

Use `configure-env.bat` para configurar automaticamente.

### Variáveis de ambiente importantes:

- `BASE_URL`: URL base do servidor
- `SECRET_KEY`: Chave secreta para sessões
- `DATABASE_URL`: Conexão com banco de dados
- `DEFAULT_ADMIN_EMAIL`: Email do admin
- `DEFAULT_ADMIN_PASSWORD`: Senha do admin

## 🔧 Credenciais de Acesso

- **Email**: admin@example.com
- **Senha**: admin123

## 📁 Estrutura de Arquivos

Após o build, você encontrará:

```
planka-personalizado/
├── client/
│   ├── dist/           # Build de produção do cliente (se feito)
│   └── node_modules/   # Dependências do cliente
├── server/
│   └── node_modules/   # Dependências do servidor
├── .env                # Configurações do ambiente
└── node_modules/       # Dependências do projeto principal
```

## ⚠️ Solução de Problemas

### Erro de Dependências
Se encontrar erros de dependências:
1. Delete as pastas `node_modules` de todos os diretórios
2. Execute novamente o script de build

### Erro de Porta em Uso
Se as portas 3000 ou 1337 estiverem ocupadas:
1. Pare outros serviços que usem essas portas
2. Ou modifique as portas nos arquivos de configuração

### Erro de Build do Cliente
Se o build do cliente falhar:
1. Verifique se o Node.js está na versão correta
2. Limpe o cache do npm: `npm cache clean --force`
3. Execute novamente o build

### Problemas com Python (Windows)
O script `build-local.bat` pula a configuração Python para evitar problemas de permissão no Windows. Algumas funcionalidades Python podem não estar disponíveis.

### Configuração de IP/Domínio
Para usar em servidores diferentes:
1. Execute `configure-env.bat`
2. Escolha o tipo de ambiente
3. Digite o IP ou domínio
4. Execute o build Docker

## 🔄 Atualizações

Para aplicar novas alterações:

1. **Desenvolvimento Local**: Apenas reinicie o servidor (Ctrl+C e execute novamente)
2. **Docker**: Execute novamente `build-docker.bat`

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs de erro
2. Confirme que todos os pré-requisitos estão instalados
3. Tente limpar e reinstalar as dependências
4. Use Docker para evitar problemas de ambiente
5. Verifique se o arquivo `.env` está configurado corretamente
