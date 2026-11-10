# Itape +

A cultura da nossa região em um só lugar.

Plataforma web que centraliza e divulga eventos culturais e educacionais de Itapetininga e região. Organizadores cadastrados enviam eventos, e o administrador aprova ou rejeita antes da publicação.

Projeto final de Programação Web — FATEC Itapetininga, 2026.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Front-end | React + Vite |
| Back-end | Node.js + Express (API REST) |
| Banco de dados | PostgreSQL (Neon) |
| Autenticação | JWT + bcrypt |
| Hospedagem | Vercel (front) + Render (API) |

## Estrutura

```
itape-plus/
├── backend/    # API REST (Express)
│   ├── src/        # config, models, controllers, routes, middlewares
│   ├── database/   # schema.sql e seed.sql
│   └── scripts/    # execução do SQL e criação do administrador
├── frontend/   # interface (React + Vite)
└── docs/       # Postman, diagramas e prints
```

## Como rodar localmente

Pré-requisito: Node.js 20 ou superior e um banco no [Neon](https://neon.tech).

### 1. Back-end

```bash
cd backend
npm install
cp .env.example .env      # no Windows (CMD): copy .env.example .env
```

Preencha o `.env` com a connection string do Neon e os dados do administrador. Depois:

```bash
npm run db:reset   # cria as tabelas e insere os dados de exemplo
npm run dev        # API em http://localhost:3000
```

Teste: abra http://localhost:3000/api/health. Deve aparecer `"banco": "conectado"`.

### 2. Front-end

Em outro terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev        # site em http://localhost:5173
```

A página inicial mostra "API conectada" quando o back-end está rodando.

## Dados de exemplo

O `npm run db:reset` cria:

- 8 categorias (Música, Teatro, Dança, Exposição, Cinema, Literatura, Educação, Festival);
- 2 organizadores: `organizador.a@exemplo.com` e `organizador.b@exemplo.com`, senha `senha1234`;
- o administrador definido em `ADMIN_EMAIL` e `ADMIN_SENHA` no `.env`;
- 6 eventos cobrindo os status pendente, aprovado e rejeitado, um evento pago e um já realizado.

`db:reset` apaga e recria as tabelas. Use apenas em desenvolvimento.

## Equipe

- Isabela Machado
- Rafael Camargo Rachid
- (completar com os demais integrantes)
