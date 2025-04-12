
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBmBJDITx4jPRldaA0c3EJkrEKh7Jy6rsE",
  authDomain: "hirescribe.firebaseapp.com",
  projectId: "hirescribe",
  storageBucket: "hirescribe.firebasestorage.app",
  messagingSenderId: "540171839094",
  appId: "1:540171839094:web:81a81b5c2a59b202e66157"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
