# Itape +

A cultura da nossa região em um só lugar.

Plataforma web que centraliza e divulga eventos culturais e educacionais de Itapetininga e região. Organizadores cadastrados enviam eventos, e o administrador aprova ou rejeita antes da publicação.

Projeto final de Programação Web — FATEC Itapetininga, 2026.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Front-end | React + Vite + React Router |
| Back-end | Node.js + Express (API REST) |
| Banco de dados | Cloud Firestore (Firebase) |
| Autenticação | Firebase Authentication (e-mail e senha, com verificação de e-mail) |
| Validação | express-validator |

## Estrutura

```
itape-plus/
├── backend/          # API REST (Express + firebase-admin)
│   ├── src/
│   │   ├── config/       # conexão com o Firebase
│   │   ├── middlewares/  # autenticação, perfil e validação
│   │   ├── routes/       # público, /eu, /painel e /admin
│   │   └── utils/        # validação do evento e conversão de datas
│   └── scripts/      # categorias e definição do administrador
├── frontend/         # interface (React + Vite)
├── docs/             # Postman, diagramas e prints
└── firestore.rules   # bloqueia acesso direto do navegador ao banco
```

## Como rodar localmente

Pré-requisito: Node.js 20 ou superior e acesso ao projeto `itape-plus` no Firebase.

### 1. Back-end

```bash
cd backend
npm install
cp .env.example .env      # no Windows (CMD): copy .env.example .env
```

Coloque a chave da conta de serviço em `backend/serviceAccountKey.json`
(Firebase › Configurações do projeto › Contas de serviço › Gerar nova chave privada).
**Nunca envie essa chave nem o `.env` ao GitHub.** Os dois já estão no `.gitignore`.

```bash
npm run categorias   # grava as 8 categorias no Firestore (só na primeira vez)
npm run dev          # API em http://localhost:3000
```

Teste: abra http://localhost:3000/api/health. Deve aparecer `"banco": "conectado"`.

### 2. Front-end

Em outro terminal:

```bash
cd frontend
npm install
npm run dev        # site em http://localhost:5173
```

### 3. Administrador

Toda conta criada pelo site é de **organizador**. Para dar o perfil de administrador,
crie a conta pelo site, confirme o e-mail e rode, dentro de `backend/`:

```bash
npm run admin -- email@exemplo.com
```

## Rotas da API

| Método | Rota | Acesso | Função |
|---|---|---|---|
| GET | `/api/health` | público | Testa a conexão com o Firestore |
| GET | `/api/categorias` | público | Lista as categorias |
| GET | `/api/eventos` | público | Eventos aprovados |
| GET | `/api/eventos/:id` | público | Detalhes de um evento aprovado |
| GET / PUT | `/api/eu` | logado | Perfil e nome público |
| GET / POST | `/api/painel/eventos` | organizador | Lista e cadastra (nasce pendente) |
| GET / PUT / DELETE | `/api/painel/eventos/:id` | organizador dono | Detalha, edita (volta a pendente) e exclui |
| GET | `/api/admin/resumo` | administrador | Quantidade por status |
| GET | `/api/admin/eventos?status=` | administrador | Fila de moderação |
| PATCH | `/api/admin/eventos/:id/aprovar` | administrador | Aprova (registra quem e quando) |
| PATCH | `/api/admin/eventos/:id/rejeitar` | administrador | Rejeita com motivo |

As rotas protegidas recebem o ID token do Firebase no cabeçalho `Authorization: Bearer <token>`.

## Equipe

- Isabela Machado
- Rafael Camargo Rachid
- Maria Luiza
- Veronica
