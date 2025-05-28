import express from "express";
import admin from "firebase-admin";
import { verifyAdmin } from "../middlewares/verifyRole.js";
import { verifyRoleSimple } from "../middlewares/verifyRole-simple.js";

const router = express.Router();

// GET /admin/users — 获取所有用户
router.get("/users", verifyRoleSimple(["admin"]), async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("users").get();
    const allUsers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(allUsers);
  } catch (err) {
    console.error("Failed to load users:", err);
    res.status(500).send("Error retrieving users");
  }
});

// GET /admin/init-schools - 初始化学校数据（临时端点）
router.get("/init-schools", async (req, res) => {
  try {
    const schools = [
      {
        code: "QUT",
        name: "Queensland University of Technology"
      },
      {
        code: "UQ", 
        name: "University of Queensland"
      },
      {
        code: "GU",
        name: "Griffith University"
      },
      {
        code: "USQ",
        name: "University of Southern Queensland"
      },
      {
        code: "JCU",
        name: "James Cook University"
      },
      {
        code: "CQU",
        name: "Central Queensland University"
      }
    ];

    const db = admin.firestore();
    
    // 检查是否已经有学校数据
    const existingSchools = await db.collection("schools").get();
    if (!existingSchools.empty) {
      return res.json({ message: "Schools already initialized", count: existingSchools.size });
    }

    // 添加学校数据
    for (const school of schools) {
      await db.collection("schools").add(school);
    }
    
    res.json({ 
      message: "Schools initialized successfully", 
      count: schools.length,
      schools: schools 
    });
  } catch (error) {
    console.error("Error initializing schools:", error);
    res.status(500).json({ error: "Failed to initialize schools" });
  }
});

export default router;
