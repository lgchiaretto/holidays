# Holidays API 🗓️

Sistema completo de gestão de feriados nacionais, estaduais e municipais do Brasil com API RESTful e autenticação JWT.

## 🌟 Características

- **API RESTful** completa para CRUD de feriados
- **Autenticação JWT** com controle de roles (admin/usuário)
- **Formato brasileiro** de datas (DD/MM/AAAA)
- **Tipos de feriados**: Nacional, Estadual, Municipal, Facultativo
- **Interface PatternFly** moderna e responsiva
- **SQLite** para armazenamento leve e eficiente
- **Container Ready** com Red Hat UBI
- **Documentação Swagger** interativa

## 📋 Pré-requisitos

- **Node.js** 18+ (recomendado: 22)
- **npm** ou **yarn**
- **Podman** ou **Docker** (para containers)

## 🚀 Instalação

### Desenvolvimento Local

```bash
# Clone o repositório
git clone https://github.com/lgchiaretto/holidays.git
cd holidays

# Instale as dependências
npm install

# Execute o seed do banco (cria usuários e feriados de exemplo)
npm run seed

# Inicie o servidor em modo desenvolvimento
npm run dev
```

O servidor estará disponível em: http://localhost:3000

### Credenciais Padrão

| Usuário | E-mail | Senha | Função |
|---------|--------|-------|--------|
| Administrator | admin@holidays.local | teste | admin |
| Salgadinho | salgadinho@holidays.local | teste123 | user |

## 🧪 Testes

### Executar Testes Unitários

```bash
# Executar todos os testes
npm test

# Executar testes com watch mode
npm run test:watch

# Executar testes com cobertura
npm run test:coverage

# Executar testes com output detalhado
npm run test:verbose
```

### Estrutura de Testes

```
tests/
├── setup.js              # Configuração do Jest
├── helpers.js            # Utilitários de teste
├── api/
│   ├── auth.test.js      # Testes da API de autenticação
│   └── holidays.test.js  # Testes da API de feriados
├── config/
│   └── config.test.js    # Testes de configuração
├── middleware/
│   └── auth.test.js      # Testes de middleware
├── models/
│   └── holiday.test.js   # Testes de modelo
└── utils/
    └── date.test.js      # Testes de utilitários de data
```

### Testes de API com cURL

```bash
# Login como admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@holidays.local", "password": "teste"}'

# Listar feriados (público)
curl http://localhost:3000/api/holidays

# Listar feriados de 2025
curl "http://localhost:3000/api/holidays?year=2025"

# Criar feriado (requer token admin)
curl -X POST http://localhost:3000/api/holidays \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{"name": "Feriado Teste", "date": "15/03/2025", "type": "municipal"}'

# Verificar se uma data é feriado
curl "http://localhost:3000/api/holidays/check/25%2F12%2F2025"

# Próximos feriados (30 dias)
curl http://localhost:3000/api/holidays/upcoming
```

## 🐳 Testes com Podman/Docker

### Build da Imagem

```bash
# Build com Podman
podman build -t holidays-api:latest .

# Build com Docker
docker build -t holidays-api:latest .
```

### Execução do Container

```bash
# Executar com Podman
podman run -d \
  --name holidays-api \
  -p 3000:3000 \
  -v holidays-data:/opt/app-root/src/data \
  holidays-api:latest

# Executar com Docker
docker run -d \
  --name holidays-api \
  -p 3000:3000 \
  -v holidays-data:/opt/app-root/src/data \
  holidays-api:latest
```

### Testar o Container

```bash
# Verificar logs
podman logs -f holidays-api

# Testar a API
curl http://localhost:3000/api/holidays

# Testar login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@holidays.local", "password": "teste"}'

# Acessar o container
podman exec -it holidays-api sh
```

### Executar Testes no Container

```bash
# Executar testes dentro do container
podman run --rm holidays-api:latest npm test

# Executar com cobertura
podman run --rm holidays-api:latest npm run test:coverage
```

### Parar e Remover Container

```bash
# Parar
podman stop holidays-api

# Remover
podman rm holidays-api

# Remover imagem
podman rmi holidays-api:latest
```

## 🔧 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm start` | Inicia o servidor em produção |
| `npm run dev` | Inicia o servidor em modo desenvolvimento |
| `npm run init-db` | Inicializa o banco de dados |
| `npm run seed` | Popula o banco com dados de exemplo |
| `npm test` | Executa os testes |
| `npm run test:watch` | Executa testes em modo watch |
| `npm run test:coverage` | Executa testes com relatório de cobertura |

## 📚 Documentação da API

A documentação interativa da API está disponível em: http://localhost:3000/api-docs

### Endpoints Principais

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/login` | Login | - |
| POST | `/api/auth/register` | Registrar usuário | - |
| GET | `/api/holidays` | Listar feriados | - |
| GET | `/api/holidays/:id` | Obter feriado | - |
| POST | `/api/holidays` | Criar feriado | Admin |
| PUT | `/api/holidays/:id` | Atualizar feriado | Admin |
| DELETE | `/api/holidays/:id` | Excluir feriado | Admin |
| GET | `/api/holidays/upcoming` | Próximos feriados | - |
| GET | `/api/holidays/check/:date` | Verificar se é feriado | - |
| GET | `/api/users` | Listar usuários | Admin |
| POST | `/api/users` | Criar usuário | Admin |

## 🎨 Interface Web

A aplicação possui interface web moderna baseada em PatternFly (Red Hat):

- **Página inicial**: `/`
- **Login usuário**: `/login.html`
- **Login admin**: `/admin/index.html`
- **Dashboard usuário**: `/user/dashboard.html`
- **Dashboard admin**: `/admin/dashboard.html`

## 📁 Estrutura do Projeto

```
holidays/
├── src/
│   ├── config/           # Configurações
│   ├── controllers/      # Controladores
│   ├── database/         # Setup SQLite
│   ├── middleware/       # Middlewares (auth, validation)
│   ├── models/           # Modelos (User, Holiday)
│   ├── public/           # Arquivos estáticos (HTML, CSS)
│   ├── routes/           # Rotas da API
│   ├── scripts/          # Scripts utilitários
│   └── index.js          # Entry point
├── tests/                # Testes unitários e de integração
├── openshift/            # Manifests Kubernetes/OpenShift
├── Dockerfile            # Imagem Docker (Red Hat UBI)
├── build.sh              # Script de build
├── deploy.sh             # Script de deploy
└── package.json
```

## 🔐 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `PORT` | Porta do servidor | 3000 |
| `NODE_ENV` | Ambiente (development/production) | development |
| `JWT_SECRET` | Chave secreta para JWT | (aleatório) |
| `JWT_EXPIRES_IN` | Tempo de expiração do token | 24h |
| `DATABASE_PATH` | Caminho do banco SQLite | ./data/holidays.db |
| `ADMIN_EMAIL` | E-mail do admin padrão | admin@holidays.local |
| `ADMIN_PASSWORD` | Senha do admin padrão | admin123 |

## 📄 Licença

MIT License

## 👥 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request
