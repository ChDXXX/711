// 简化的认证中间件 - 仅用于开发环境
import admin from "firebase-admin";

// 开发环境：简化的token验证
async function verifyFirebaseTokenSimple(req) {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  if (!idToken) throw new Error("No token provided");

  try {
    console.log("🔍 Simple token verification...");
    
    // 跳过token验证，直接从token中解析用户信息
    // 这只是临时解决方案，生产环境不应该这样做
    const tokenParts = idToken.split('.');
    if (tokenParts.length !== 3) {
      throw new Error("Invalid token format");
    }
    
    // 解析token payload（不验证签名）
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    const uid = payload.user_id || payload.sub;
    
    if (!uid) {
      throw new Error("No user ID in token");
    }
    
    console.log("✅ Token parsed, user ID:", uid);
    
    // 从Firestore获取用户数据（这部分是正常的）
    console.log("📡 Fetching user document from Firestore...");
    const userDoc = await admin.firestore().doc(`users/${uid}`).get();
    
    if (!userDoc.exists) {
      console.log("❌ User document not found in Firestore for:", uid);
      throw new Error("User not found in Firestore");
    }
    
    console.log("✅ User data retrieved from Firestore");
    return { uid, ...userDoc.data() };
  } catch (error) {
    console.error("🚨 Simple token verification error:", error.message);
    throw error;
  }
}

// 通用角色验证函数
export function verifyRoleSimple(allowedRoles = []) {
  return async (req, res, next) => {
    try {
      const user = await verifyFirebaseTokenSimple(req);
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).send("Access denied. Role not allowed.");
      }
      req.user = user;
      next();
    } catch (err) {
      console.error("verifyRoleSimple error:", err.message);
      res.status(401).send("Unauthorized");
    }
  };
}

// 学生验证
export async function verifyStudentSimple(req, res, next) {
  try {
    const user = await verifyFirebaseTokenSimple(req);
    if (user.role !== "student") return res.status(403).send("Only students can access this resource");
    req.user = user;
    next();
  } catch (err) {
    console.error("verifyStudentSimple error:", err.message);
    res.status(401).send("Unauthorized");
  }
}

// 雇主验证
export async function verifyEmployerSimple(req, res, next) {
  try {
    const user = await verifyFirebaseTokenSimple(req);
    if (user.role !== "employer") return res.status(403).send("Only employers can access this resource");
    req.user = user;
    next();
  } catch (err) {
    console.error("verifyEmployerSimple error:", err.message);
    res.status(401).send("Unauthorized");
  }
} 