
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// IMPORTANTE: Estas variáveis devem ser definidas em seu ambiente de hospedagem (ex: Vercel, Netlify).
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.databaseURL);

let db: any = null; // Use `any` para evitar erros de tipo se não estiver configurado

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
  } catch (error) {
    console.error("A inicialização do Firebase falhou:", error);
    // Falha silenciosa, isFirebaseConfigured permanecerá false
  }
} else {
  console.warn("A configuração do Firebase está ausente. O recurso de Sincronização na Nuvem será desativado.");
}

export const database = db;
export const checkFirebaseConfig = () => isFirebaseConfigured;
