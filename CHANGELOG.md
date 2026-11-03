# Changelog

Todas as mudanças relevantes do Itape + são registradas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e versões em [SemVer](https://semver.org/lang/pt-BR/).

## [Não lançado]

### Adicionado
- Estrutura do monorepo com `backend`, `frontend` e `docs`
- API em Express com helmet, CORS e rota `/api/health`
- Conexão com PostgreSQL (Neon) e scripts `db:schema`, `db:seed` e `db:reset`
- Schema com as tabelas `usuarios`, `categorias` e `eventos`, incluindo as regras de status e motivo de rejeição
- Seed com categorias, dois organizadores, administrador e eventos de exemplo
- Projeto React com Vite, rotas das páginas do MVP e verificação da conexão com a API
