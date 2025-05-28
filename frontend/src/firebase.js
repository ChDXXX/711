// frontend/src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDu-dZKDSBXCdnL97Lq1uxTbhRu7R1UIvo",
  authDomain: "digital-skill-wallet.firebaseapp.com",
  projectId: "digital-skill-wallet",
  storageBucket: "digital-skill-wallet.appspot.com",
  messagingSenderId: "731407952694",
  appId: "1:731407952694:web:f21d4c9c88ac3cdf22a197",
  measurementId: "G-Y92RXB0L0V"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app); // 使用云端Firestore
export const storage = getStorage(app);
export const functions = getFunctions(app);

// 添加连接状态日志
console.log("🔥 Firebase initialized:");
console.log("- Project ID:", firebaseConfig.projectId);
console.log("- Auth Domain:", firebaseConfig.authDomain);

// 开发环境：连接到本地Functions模拟器，但保持云端数据库和认证
if (import.meta.env.DEV) {
  // 只连接Functions模拟器，不连接Firestore和Auth模拟器
  try {
    connectFunctionsEmulator(functions, "localhost", 5001);
    console.log("✅ Connected to Functions emulator");
  } catch (error) {
    console.log("⚠️ Functions emulator already connected or not available");
  }
  
  console.log("🔥 Firebase config:");
  console.log("- Auth: Cloud ☁️");
  console.log("- Firestore: Cloud ☁️"); 
  console.log("- Functions: Local 💻 (accessing Cloud Firestore)");
}

export { app };
