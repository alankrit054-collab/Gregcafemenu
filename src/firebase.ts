import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBZ1Z9SWX1CJR9Gg9Z3sZbjJezzvKCxS_8",
  authDomain: "authentic-muse-ql2lq.firebaseapp.com",
  projectId: "authentic-muse-ql2lq",
  storageBucket: "authentic-muse-ql2lq.firebasestorage.app",
  messagingSenderId: "746819477439",
  appId: "1:746819477439:web:bf2f52ce4ca29a3c4c8b0a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-1f2888a0-3726-4090-8f47-aaf6fcf36231");


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
