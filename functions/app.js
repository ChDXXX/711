import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import admin from "firebase-admin";

//  Debug wrap — 捕捉非法路径注册
const wrapMethods = ["get", "post", "put", "delete", "use"];
wrapMethods.forEach((method) => {
  const original = express.Router.prototype[method];
  express.Router.prototype[method] = function (path, ...handlers) {
    if (typeof path === "string" && path.startsWith("http")) {
      console.trace(`❗Illegal router.${method} path: ${path}`);
    }
    return original.call(this, path, ...handlers);
  };
});

//  路由模块
import userRoutes from "./routes/user.js";
import skillRoutes from "./routes/skill.js";
import studentRoutes from "./routes/student.js";
import schoolRoutes from "./routes/school.js";
import employerRoutes from "./routes/employer.js";
import jobRoutes from "./routes/job.js";
import adminRoutes from "./routes/admin.js";
import courseRoutes from "./routes/course.js";
import teacherRoutes from "./routes/teacher.js";

const app = express();

//  完全禁用CORS检查（开发环境）
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

//  JSON 请求体解析
app.use(express.json());

//  文件上传中间件
app.use(fileUpload());

//  路由注册
app.use("/user", userRoutes);
app.use("/skill", skillRoutes);
app.use("/student", studentRoutes);
app.use("/school", schoolRoutes);
app.use("/employer", employerRoutes);
app.use("/job", jobRoutes);
app.use("/admin", adminRoutes);
app.use("/course", courseRoutes);
app.use("/teacher", teacherRoutes);

//  健康检查接口
app.get("/", (_, res) => res.send("Functions API running."));

//  Firestore连接测试
app.get("/test-firestore", async (req, res) => {
  try {
    console.log("🧪 Testing Firestore connection...");
    const testDoc = await admin.firestore().collection("test").limit(1).get();
    console.log("✅ Firestore connection successful");
    res.json({ 
      status: "success", 
      message: "Firestore connection working",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Firestore connection failed:", error.message);
    res.status(500).json({ 
      status: "error", 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

//  测试majors数据（无需认证）
app.get("/test-majors", async (req, res) => {
  try {
    console.log("🧪 Testing majors collection...");
    const snapshot = await admin.firestore().collection("majors").get();
    const majors = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    console.log("✅ Majors data retrieved:", majors.length, "items");
    res.json({ 
      status: "success", 
      count: majors.length,
      majors: majors,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Majors fetch failed:", error.message);
    res.status(500).json({ 
      status: "error", 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default app;
