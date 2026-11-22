// RN08: o perfil de administrador só é concedido por este script, nunca pelo site.
// Uso (dentro de backend/): npm run admin -- email@exemplo.com
// A pessoa precisa ter criado a conta pelo site antes.
require('dotenv').config();
const { Timestamp } = require('firebase-admin/firestore');
const { db, auth } = require('../src/config/firebase');

async function definirAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.error('Informe o e-mail: npm run admin -- email@exemplo.com');
    process.exit(1);
  }

  try {
    const usuario = await auth.getUserByEmail(email);
    await db.collection('usuarios').doc(usuario.uid).set({
      nome: usuario.displayName || email.split('@')[0],
      email: usuario.email,
      perfil: 'administrador',
      atualizadoEm: Timestamp.now(),
    }, { merge: true });
    console.log(`Perfil de administrador definido para ${usuario.email}.`);
    process.exit(0);
  } catch (erro) {
    console.error('Não foi possível definir o administrador:', erro.message);
    process.exit(1);
  }
}

definirAdmin();
