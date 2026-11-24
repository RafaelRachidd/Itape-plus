# Changelog

Todas as mudanças relevantes do Itape + são registradas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e versões em [SemVer](https://semver.org/lang/pt-BR/).

## [1.1.0] - 2026-11-24

### Adicionado
- Recuperação de senha na tela de login ("Esqueci minha senha"), com o e-mail de redefinição do Firebase Authentication

## [1.0.0] - 2026-11-23

Versão final entregue na disciplina de Programação Web (FATEC Itapetininga).

### Adicionado
- Página inicial, catálogo com busca e filtros, detalhes do evento e calendário, no visual do protótipo do Google Stitch
- Cadastro e login pelo Firebase Authentication, com verificação de e-mail obrigatória
- Painel do organizador: cadastrar, editar e excluir os próprios eventos, ver status e motivo da rejeição e editar o perfil público
- Moderação do administrador: fila por status, aprovar e rejeitar com motivo, registrando quem moderou e quando
- API com verificação do ID token do Firebase, controle de acesso por perfil e validação por campo (express-validator)
- Script `npm run admin -- email` para definir o administrador e `npm run categorias` para gravar as categorias
- Regras do Firestore (`firestore.rules`) bloqueando acesso direto do navegador ao banco
- Capa padrão quando a imagem do evento não carrega

### Alterado
- Banco de dados e autenticação migrados de PostgreSQL (Neon) com JWT para Cloud Firestore com Firebase Authentication

### Removido
- Scripts e dependências do PostgreSQL (`pg`, `bcryptjs`, `jsonwebtoken`, `db:*`)

## [0.1.0] - 2026-11-10

### Adicionado
- Estrutura do monorepo com `backend`, `frontend` e `docs`
- API em Express com helmet, CORS e rota `/api/health`
- Conexão com PostgreSQL (Neon), schema com `usuarios`, `categorias` e `eventos` e seed de exemplo
- Projeto React com Vite e rotas das páginas do MVP

[1.0.0]: https://github.com/RafaelRachidd/Itape-plus/releases/tag/v1.0.0
[0.1.0]: https://github.com/RafaelRachidd/Itape-plus/releases/tag/v0.1.0
