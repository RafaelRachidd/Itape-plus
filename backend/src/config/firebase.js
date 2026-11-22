// Conexão com o Firebase pelo SDK Admin (Firestore e Authentication).
// A chave da conta de serviço fica apenas no computador (GOOGLE_APPLICATION_CREDENTIALS).
const { initializeApp, applicationDefault, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore();
const auth = getAuth();

module.exports = { db, auth };
