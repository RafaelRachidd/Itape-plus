// Conexao do backend com o Firestore usando Firebase Admin SDK.
// A chave privada e carregada de GOOGLE_APPLICATION_CREDENTIALS no arquivo .env.
// Nunca coloque credenciais administrativas no frontend.
const { initializeApp, applicationDefault, getApps, getApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const app = getApps().length
  ? getApp()
  : initializeApp({
      credential: applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID || undefined,
    });

module.exports = getFirestore(app);
