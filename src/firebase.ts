import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBZ1Z9SWX1CJR9Gg9Z3sZbjJezzvKCxS_8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "authentic-muse-ql2lq.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "authentic-muse-ql2lq",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "authentic-muse-ql2lq.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "746819477439",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:746819477439:web:bf2f52ce4ca29a3c4c8b0a"
};

const app = initializeApp(firebaseConfig);
const dbId = import.meta.env.VITE_FIREBASE_DB_ID || "ai-studio-1f2888a0-3726-4090-8f47-aaf6fcf36231";
export const db = getFirestore(app, dbId);


// CRITICAL CONSTRAINT: Validate Firestore connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Firestore connected successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. Client is offline.");
    } else {
      console.log("Firebase connection response:", error);
    }
  }
}

testConnection();
