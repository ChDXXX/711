// frontend/src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // 新增：导入 Storage 模块

const firebaseConfig = {
  apiKey: "AIzaSyDu-dZKDSBXCdnL97Lq1uxTbhRu7R1UIvo",
  authDomain: "digital-skill-wallet.firebaseapp.com",
  projectId: "digital-skill-wallet",
  storageBucket: "digital-skill-wallet.appspot.com", // 修正：应为 .appspot.com
  messagingSenderId: "731407952694",
  appId: "1:731407952694:web:f21d4c9c88ac3cdf22a197",
  measurementId: "G-Y92RXB0L0V"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // 新增：导出 storage
export { app };