# Changelog

Todas as mudanças relevantes do Itape + são registradas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e versões em [SemVer](https://semver.org/lang/pt-BR/).

## [Não lançado]

## [0.2.0] - Catálogo público

### Adicionado
- Rotas `GET /api/categorias`, `/api/eventos`, `/api/eventos/proximos` e `/api/eventos/:id`, só com eventos aprovados (RN02)
- Página inicial com os próximos eventos (RF01) e página Eventos com busca e filtros por categoria, data e gratuitos (RF02–RF04, RF14)
- Busca sem diferenciar acentos e maiúsculas (extensão `unaccent`)
- Página de detalhes com local, valor, link de inscrição e contato do organizador (RF05, RF15)
- Validação dos parâmetros da API com express-validator (RNF04) e tratamento central de erros

### Corrigido
- Conexão com o Neon pela porta 443 (driver `@neondatabase/serverless`), porque a rede da FATEC bloqueia a porta 5432

## [0.1.0] - 2026-11-10 - Estrutura inicial

### Adicionado
- Estrutura do monorepo com `backend`, `frontend` e `docs`
- API em Express no padrão MVC, com helmet, CORS e rota `/api/health`
- Conexão com PostgreSQL (Neon) e scripts `db:schema`, `db:seed` e `db:reset`
- Schema com as tabelas `usuarios`, `categorias` e `eventos`, incluindo as regras de status e motivo de rejeição
- Seed com categorias, dois organizadores, administrador e eventos de exemplo
- Projeto React com Vite, rotas das páginas do MVP e verificação da conexão com a API

### Integrado
- Configuração inicial do front-end e da API feita na branch `develop` (Rafael)
