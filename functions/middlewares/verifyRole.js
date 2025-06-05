// Unified role-based middleware - verifyRole.js
import admin from "firebase-admin";

// 创建带超时的Promise包装器
function withTimeout(promise, timeoutMs = 15000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

// 重试机制
async function retryOperation(operation, maxRetries = 2, delay = 1000) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries) throw error;
      console.log(`🔄 Retry ${i + 1}/${maxRetries} after error:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// 检查是否在模拟器环境中
function isEmulatorEnvironment() {
  return process.env.FUNCTIONS_EMULATOR === 'true' || 
         process.env.NODE_ENV === 'development' ||
         !!process.env.FIREBASE_AUTH_EMULATOR_HOST;
}

// Common Firebase auth + Firestore user extraction
async function verifyFirebaseToken(req) {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  if (!idToken) throw new Error("No token provided");

  try {
    console.log("🔍 Verifying Firebase token...");
    
    let decoded;
    
    if (isEmulatorEnvironment()) {
      console.log("🧪 Using emulator-friendly token verification...");
      // 在模拟器环境中，使用更宽松的验证设置
      decoded = await retryOperation(async () => {
        return await withTimeout(
          admin.auth().verifyIdToken(idToken, false), // checkRevoked = false for emulator
          10000 // 更短的超时时间
        );
      }, 1, 500); // 更少的重试次数和更短的延迟
    } else {
      console.log("🌐 Using production token verification...");
      // 生产环境使用完整验证
      decoded = await retryOperation(async () => {
        return await withTimeout(
          admin.auth().verifyIdToken(idToken, true), // checkRevoked = true
          15000 // 15秒超时
        );
      });
    }
    
    console.log("✅ Token verified for user:", decoded.uid);
    
    console.log("📡 Fetching user document from Firestore...");
    const userDoc = await withTimeout(
      admin.firestore().doc(`users/${decoded.uid}`).get(),
      10000 // 10秒超时
    );
    
    if (!userDoc.exists) {
      console.log("❌ User document not found in Firestore for:", decoded.uid);
      throw new Error("User not found in Firestore");
    }
    
    console.log("✅ User data retrieved from Firestore");
    return { uid: decoded.uid, ...userDoc.data() };
  } catch (error) {
    console.error("🚨 Token verification error:", error.message);
    
    // 提供更详细的错误信息
    if (error.message.includes('timed out')) {
      throw new Error("Authentication service temporarily unavailable. Please try again.");
    } else if (error.code === 'auth/id-token-expired') {
      throw new Error("Token expired. Please log in again.");
    } else if (error.code === 'auth/id-token-revoked') {
      throw new Error("Token revoked. Please log in again.");
    } else if (error.code === 'auth/invalid-id-token') {
      throw new Error("Invalid token. Please log in again.");
    }
    
    throw error;
  }
}

//  Student-only route
export async function verifyStudent(req, res, next) {
  try {
    const user = await verifyFirebaseToken(req);
    if (user.role !== "student") return res.status(403).send("Only students can access this resource");
    req.user = user;
    next();
  } catch (err) {
    console.error("verifyStudent error:", err.message);
    res.status(401).send("Unauthorized");
  }
}

// Teacher-only route
export async function verifyTeacher(req, res, next) {
  try {
    const user = await verifyFirebaseToken(req);
    if (user.role !== "teacher" && user.role !== "school") return res.status(403).send("Only teachers can access this resource");
    req.user = user;
    next();
  } catch (err) {
    console.error("verifyTeacher error:", err.message);
    res.status(401).send("Unauthorized");
  }
}

//  Employer-only route
export async function verifyEmployer(req, res, next) {
  try {
    const user = await verifyFirebaseToken(req);
    if (user.role !== "employer") return res.status(403).send("Only employers can access this resource");
    req.user = user;
    next();
  } catch (err) {
    console.error("verifyEmployer error:", err.message);
    res.status(401).send("Unauthorized");
  }
}

// Generic multi-role route, e.g. ["admin", "school"]
export function verifyRole(allowedRoles = []) {
  return async (req, res, next) => {
    try {
      const user = await verifyFirebaseToken(req);
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).send("Access denied. Role not allowed.");
      }
      req.user = user;
      next();
    } catch (err) {
      console.error("verifyRole error:", err.message);
      res.status(401).send("Unauthorized");
    }
  };
}

// Admin-only route (moved from admin.js)
export async function verifyAdmin(req, res, next) {
  try {
    const user = await verifyFirebaseToken(req);
    if (user.role !== "admin") return res.status(403).send("Only admins can access this resource");
    req.user = user;
    next();
  } catch (err) {
    console.error("verifyAdmin error:", err.message);
    res.status(401).send("Unauthorized");
  }
}