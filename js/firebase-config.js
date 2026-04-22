// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDVty30S6y_qc1eMs3kVctcIpLt6Suw4dA",
  authDomain: "mudapos-e8a4a.firebaseapp.com",
  projectId: "mudapos-e8a4a",
  storageBucket: "mudapos-e8a4a.firebasestorage.app",
  messagingSenderId: "864215339664",
  appId: "1:864215339664:web:1a97898b85ca3c1cb3be15"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const dbCloud = getFirestore(app);
