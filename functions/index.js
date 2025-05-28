import functions from "firebase-functions";
import admin from "firebase-admin";
import app from "./app.js";
import { syncUserDocument } from "./scripts/syncUserOnLogin.js";

// 初始化Firebase Admin SDK
admin.initializeApp();

// 添加Firestore设置
const db = admin.firestore();
db.settings({
  ignoreUndefinedProperties: true,
});

console.log("🔥 Firebase Admin initialized for project:", admin.app().options.projectId);

export const api = functions.https.onRequest(app);

export const syncUserDoc = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
  }

  const user = await admin.auth().getUser(context.auth.uid);
  await syncUserDocument(user);
  return { message: "User document synced." };
});
