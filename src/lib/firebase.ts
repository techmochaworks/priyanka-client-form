import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAlJW-zLUxSRgMIqKEw8EnKqTRJO77nqZU",
  authDomain: "priyanka-enterprises-69.firebaseapp.com",
  projectId: "priyanka-enterprises-69",
  storageBucket: "priyanka-enterprises-69.firebasestorage.app",
  messagingSenderId: "21057243927",
  appId: "1:21057243927:web:e741975b515d11a5188552",
  measurementId: "G-N0KVW5WBLG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser)
if (typeof window !== 'undefined') {
  getAnalytics(app);
}

export default app;
