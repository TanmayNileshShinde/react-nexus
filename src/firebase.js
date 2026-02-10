// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyARc1D7X5VV8HrRz7uyniBQ1Fw3CVqDbVU",
  authDomain: "react-nexus-9798.firebaseapp.com",
  projectId: "react-nexus-9798",
  storageBucket: "react-nexus-9798.firebasestorage.app",
  messagingSenderId: "195342203585",
  appId: "1:195342203585:web:9e3f0065b4c144603f3240",
  measurementId: "G-2J7JY2XJRN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);