// Configuração pública do Firebase (apenas Authentication no navegador).
// Os dados do Firestore são lidos e gravados somente pela API.
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBEZLFjMJcxrC0Xp3dwm04qCIG7Q1il6Ck",
  authDomain: "itape-plus.firebaseapp.com",
  projectId: "itape-plus",
  storageBucket: "itape-plus.firebasestorage.app",
  messagingSenderId: "130548589894",
  appId: "1:130548589894:web:e250deaf27cc5a9b05b147"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Opcional, só para testes locais com o Firebase Emulator Suite.
if (import.meta.env.VITE_FIREBASE_AUTH_EMULATOR) {
  connectAuthEmulator(auth, import.meta.env.VITE_FIREBASE_AUTH_EMULATOR, { disableWarnings: true });
}
