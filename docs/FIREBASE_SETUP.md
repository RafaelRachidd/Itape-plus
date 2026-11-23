# Itape + — configuração local com Firebase

Esta documentação vale para a branch `versao-firebase` e **não altera o projeto Neon original**.

## Pré-requisitos

- Node.js 22 ou superior (verifique com `node -v`).
- Projeto Firebase criado, com Firestore Standard e Firebase Authentication (E-mail/senha).
- Aplicativo Web registrado para o frontend.
- No VS Code, selecione a branch `versao-firebase` e obtenha as alterações do GitHub.

## 1. Obter uma credencial administrativa para desenvolvimento local

No Firebase Console: Configurações do projeto (engrenagem) → Contas de serviço →
Firebase Admin SDK → Gerar nova chave privada. Salve o JSON baixado dentro de
`backend/` e renomeie-o para `serviceAccountKey.json`.

**Nunca compartilhe ou envie esse JSON ao GitHub.** O arquivo está no `.gitignore`.
Para produção (Render), usaremos uma forma segura de fornecer credenciais como segredo,
sem incluir arquivos privados no repositório.

## 2. Configurar o backend

No Prompt de Comando do Windows:

```cmd
cd C:\Users\Fatec\Desktop\Itape-plus\backend
npm install firebase-admin
copy .env.example .env
```

Confira no `.env`:
- `FIREBASE_PROJECT_ID=itape-plus` (ajuste caso seu ID seja outro)
- `GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json`

Depois:

```cmd
npm run dev
```

Acesse `http://localhost:3000/api/health`.
Se o Firestore estiver vazio, espere:
```json
{"status":"ok","banco":"conectado","categorias":0}
```

**Não use `npm run db:reset` nesta versão**: são scripts antigos de PostgreSQL.

## 3. Configurar o frontend

Na pasta `frontend`, instale `firebase` e configure `src/firebase.js`
com `initializeApp`, `getAuth` e `getFirestore`, utilizando os dados
da configuração Web do seu projeto Firebase (não a chave privada Admin).

```cmd
cd C:\Users\Fatec\Desktop\Itape-plus\frontend
npm install firebase
copy .env.example .env
npm run dev
```

Acesse `http://localhost:5173`. A tela inicial deve mostrar
`API conectada: 0 categorias no banco.`.

## Próximas etapas

Criar coleções `categorias`, `usuarios` e `eventos`; implementar
as APIs, cadastro, login, controle de acesso e moderação. A autenticação
estará habilitada no console, mas as telas e rotas ainda não existem.
