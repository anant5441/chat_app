// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2JFl-hEiUfFJdiH7itEKGc-7_KrjqZfI",
  authDomain: "chat-app-user-to-user.firebaseapp.com",
  projectId: "chat-app-user-to-user",
  storageBucket: "chat-app-user-to-user.firebasestorage.app",
  messagingSenderId: "502322685284",
  appId: "1:502322685284:web:4b6d0b3a498e20d460c671",
  measurementId: "G-XTZ6BW8ED4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

const analytics = getAnalytics(app);