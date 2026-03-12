import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBGY_sci4sRWPjjFjdFZWWgzI7qjDobdGk",
  authDomain: "tasktracker-67b04.firebaseapp.com",
  projectId: "tasktracker-67b04",
  storageBucket: "tasktracker-67b04.firebasestorage.app",
  messagingSenderId: "538140474290",
  appId: "1:538140474290:web:0f564bcb26f57a017002ab",
  measurementId: "G-3B2ET0T8FS",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const firebaseAuth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
