import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
export const db = getFirestore(app);