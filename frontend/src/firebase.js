// frontend/src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Optional: not needed unless you use Analytics
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDu-dZKDSBXCdnL97Lq1uxTbhRu7R1UIvo",
  authDomain: "digital-skill-wallet.firebaseapp.com",
  projectId: "digital-skill-wallet",
  storageBucket: "digital-skill-wallet.firebasestorage.app",
  messagingSenderId: "731407952694",
  appId: "1:731407952694:web:f21d4c9c88ac3cdf22a197",
  measurementId: "G-Y92RXB0L0V"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);


/*
  // ✅ Connect to emulators when using localhost
  if (location.hostname === "localhost") {
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(db, "localhost", 8080);
  }
*/

export { app };