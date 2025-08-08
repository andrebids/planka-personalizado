# Configuração do Planka

## Configuração do BASE_URL

O Planka agora usa uma variável de ambiente `PLANKA_BASE_URL` que pode ser configurada para diferentes ambientes.

### Para Desenvolvimento Local

```bash
# Usar localhost (padrão)
export PLANKA_BASE_URL=http://localhost:3000
docker-compose up -d
```

### Para Servidor Remoto

```bash
# Usar IP do servidor
export PLANKA_BASE_URL=http://104.197.195.116:3000
docker-compose up -d
```

### Usando arquivo .env

Crie um arquivo `.env` na raiz do projeto:

```bash
# Para desenvolvimento local
PLANKA_BASE_URL=http://localhost:3000

# Para servidor remoto
# PLANKA_BASE_URL=http://104.197.195.116:3000
```

### Configuração Automática

O sistema usa `http://localhost:3000` como padrão se a variável `PLANKA_BASE_URL` não estiver definida.

## Credenciais de Acesso

- **Email**: `admin@example.com`
- **Password**: `admin123`

## Troubleshooting

Se tiver problemas de login em loop:
1. Verifique se o `PLANKA_BASE_URL` está correto para o ambiente
2. Limpe os cookies do browser
3. Reinicie os containers: `docker-compose down && docker-compose up -d`
