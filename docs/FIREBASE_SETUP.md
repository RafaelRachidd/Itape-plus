# Itape + — configuração local com Firebase

Passo a passo para rodar o projeto no Windows (CMD).

## Pré-requisitos

- Node.js 20 ou superior (`node -v`).
- Acesso ao projeto `itape-plus` no Firebase (Firestore e Authentication por e-mail e senha).
- A chave da conta de serviço `serviceAccountKey.json`, recebida por mensagem privada
  ou gerada em Firebase › Configurações do projeto › Contas de serviço › Gerar nova chave privada.

**Nunca envie a chave nem o `.env` ao GitHub.** Os dois estão no `.gitignore`.

## 1. Back-end

```cmd
cd C:\caminho\Itape-plus\backend
npm install
copy .env.example .env
```

Coloque o `serviceAccountKey.json` dentro de `backend\` e confira no `.env`:

```
FIREBASE_PROJECT_ID=itape-plus
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
```

```cmd
npm run categorias
npm run dev
```

Teste em `http://localhost:3000/api/health`: deve aparecer `"banco": "conectado"` e `"categorias": 8`.

## 2. Front-end

Em outro CMD:

```cmd
cd C:\caminho\Itape-plus\frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## 3. Administrador

Crie a conta pelo site, confirme o e-mail e rode, dentro de `backend\`:

```cmd
npm run admin -- email@exemplo.com
```

## 4. Regras do Firestore

No Firebase Console › Firestore › Regras, cole o conteúdo de `firestore.rules` e publique.
