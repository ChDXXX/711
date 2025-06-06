import express from "express";
import admin from "firebase-admin";
import { verifyEmployerSimple } from "../middlewares/verifyRole-simple.js";

const router = express.Router();

// Middleware: verify employer identity
async function verifyEmployer(req, res, next) {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  if (!idToken) return res.status(401).send("Unauthorized");

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const userDoc = await admin.firestore().doc(`users/${uid}`).get();
    if (!userDoc.exists) return res.status(403).send("User not found");

    const userData = userDoc.data();
    if (userData.role !== "employer") {
      return res.status(403).send("Access denied. Only employers can use this endpoint.");
    }

    req.user = { uid, ...userData };
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(403).send("Invalid token");
  }
}

// GET /employer/student/:id
router.get("/student/:id", verifyEmployerSimple, async (req, res) => {
  const studentId = req.params.id;

  try {
    const studentDoc = await admin.firestore().doc(`users/${studentId}`).get();
    if (!studentDoc.exists) return res.status(404).send("Student not found");

    const studentData = studentDoc.data();
    if (studentData.role !== "student") {
      return res.status(403).send("The requested user is not a student.");
    }

    const { email, customUid, schoolId } = studentData;
    res.json({ email, customUid, schoolId });
  } catch (error) {
    console.error("Error fetching student info:", error.message);
    res.status(500).send("Error retrieving student data");
  }
});

// GET /employer/student/:id/skills
router.get("/student/:id/skills", verifyEmployerSimple, async (req, res) => {
  const studentId = req.params.id;

  try {
    const snapshot = await admin.firestore()
      .collection("skills")
      .where("ownerId", "==", studentId)
      .orderBy("createdAt", "desc")
      .get();

    const skills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(skills);
  } catch (error) {
    console.error("Error fetching student skills:", error.message);
    res.status(500).send("Error retrieving skills");
  }
});

// GET /employer/schools
router.get("/schools", async (req, res) => {
  try {
    // 尝试从Firestore获取，如果失败则返回硬编码数据
    try {
      const snapshot = await admin.firestore().collection("schools").get();
      if (!snapshot.empty) {
        const schools = snapshot.docs.map(doc => ({
          code: doc.data().code,
          name: doc.data().name,
        }));
        return res.json(schools);
      }
    } catch (firestoreError) {
      console.log("Firestore not available, using hardcoded school data");
    }
    
    // 硬编码的学校数据作为备用
    const hardcodedSchools = [
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
    
    res.json(hardcodedSchools);
  } catch (err) {
    console.error("Error fetching schools:", err);
    res.status(500).send("Failed to fetch school list");
  }
});

// GET /employer/school/:schoolId/students
router.get("/school/:schoolId/students", verifyEmployerSimple, async (req, res) => {
  const { schoolId } = req.params;

  try {
    const snapshot = await admin.firestore()
      .collection("users")
      .where("role", "==", "student")
      .where("schoolId", "==", schoolId)
      .get();

    const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(students);
  } catch (err) {
    console.error("Error fetching students for employer:", err.message);
    res.status(500).send("Failed to retrieve students");
  }
});

// GET /employer/students/skills/:skill
router.get("/students/skills/:skill", verifyEmployerSimple, async (req, res) => {
  const { skill } = req.params;
  const { softSkills } = req.query; // 获取软技能参数
  const { uid } = req.user;

  try {
    console.log(`🔍 Backend: 雇主(${uid})查询技能: ${skill}, 软技能: ${softSkills || '无'}`);
    
    // Step 1: Get all skills
    console.log(`📚 Backend: 正在获取技能集合...`);
    const skillSnapshot = await admin.firestore().collection("skills").get();
    console.log(`📊 Backend: 找到${skillSnapshot.docs.length}个技能记录`);

    // Step 2: Filter those matching the search term
    console.log(`🔍 Backend: 正在过滤匹配的技能...`);
    const matchedSkills = skillSnapshot.docs.filter(doc =>
      doc.data().title.toLowerCase().includes(skill.toLowerCase())
    );
    console.log(`✅ Backend: 找到${matchedSkills.length}个匹配的技能`);

    // Step 3: Get unique ownerIds (student UIDs)
    const ownerIds = [...new Set(matchedSkills.map(doc => doc.data().ownerId))];
    console.log(`👥 Backend: 找到${ownerIds.length}个拥有匹配技能的学生ID`);

    // Step 4: Build a map of studentId -> skill titles
    const studentSkillsMap = {};
    matchedSkills.forEach(doc => {
      const { ownerId, title } = doc.data();
      if (!studentSkillsMap[ownerId]) studentSkillsMap[ownerId] = [];
      studentSkillsMap[ownerId].push(title);
    });

    // Step 5: Fetch student user documents
    console.log(`🔄 Backend: 正在获取学生详细信息...`);
    const students = [];
    for (const id of ownerIds) {
      const userDoc = await admin.firestore().collection("users").doc(id).get();
      if (userDoc.exists && userDoc.data().role === 'student') {
        const userData = userDoc.data();
        
        // 获取学校名称
        let schoolName = null;
        if (userData.schoolId) {
          const schoolSnapshot = await admin.firestore()
            .collection("schools")
            .where("code", "==", userData.schoolId)
            .limit(1)
            .get();
            
          if (!schoolSnapshot.empty) {
            schoolName = schoolSnapshot.docs[0].data().name;
          }
        }
        
        students.push({
          id: userDoc.id,
          ...userData,
          schoolName,
          skills: studentSkillsMap[userDoc.id] || [] // attach actual skill titles
        });
      }
    }
    
    console.log(`✅ Backend: 找到${students.length}名符合条件的学生`);
    
    // 返回前打印第一个学生的信息（如果有）作为调试
    if (students.length > 0) {
      const sample = {...students[0]};
      delete sample.email; // 不打印敏感信息
      console.log(`📋 Backend: 样本学生数据:`, JSON.stringify(sample));
    }

    res.json(students);
  } catch (error) {
    console.error("❌ Error searching students by skill:", error.message);
    res.status(500).send("Failed to search students");
  }
});

// PATCH /employer/applications/:applicationId — 更新状态（通过 / 拒绝 / 面试）
router.patch("/applications/:applicationId", verifyEmployerSimple, async (req, res) => {
  const { applicationId } = req.params;
  const { status, note } = req.body;

  if (!["pending", "accepted", "rejected", "interview"].includes(status)) {
    return res.status(400).send("Invalid status value");
  }

  try {
    const appRef = admin.firestore().collection("applications").doc(applicationId);
    const appDoc = await appRef.get();

    if (!appDoc.exists) {
      return res.status(404).send("Application not found");
    }

    const application = appDoc.data();

    // 检查是否是该雇主的岗位
    const jobRef = admin.firestore().collection("jobs").doc(application.jobId);
    const jobDoc = await jobRef.get();

    if (!jobDoc.exists || jobDoc.data().employerId !== req.user.uid) {
      return res.status(403).send("You are not authorized to modify this application");
    }

    await appRef.update({
      status,
      note: note || "",
    });

    res.send("Application status updated");
  } catch (error) {
    console.error("Error updating application:", error.message);
    res.status(500).send("Failed to update application");
  }
});


// GET /employer/recent-applications
router.get("/recent-applications", verifyEmployerSimple, async (req, res) => {
  try {
    const snapshot = await admin.firestore()
      .collection("applications")
      .where("employerId", "==", req.user.uid)
      .orderBy("appliedAt", "desc")
      .limit(10)
      .get();

    const applications = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const studentDoc = await admin.firestore().doc(`users/${data.studentId}`).get();
      const studentName = studentDoc.exists ? studentDoc.data().name : "Unknown";

      applications.push({
        id: doc.id,
        jobId: data.jobId,
        studentId: data.studentId,
        studentName,
        message: data.message || "",
        appliedAt: data.appliedAt,
      });
    }

    res.json(applications);
  } catch (error) {
    console.error("Error fetching recent applications:", error);
    res.status(500).send("Failed to retrieve recent applications");
  }
});

// GET /employer/application-summary
router.get("/application-summary", verifyEmployerSimple, async (req, res) => {
  try {
    const snapshot = await admin.firestore()
      .collection("applications")
      .where("employerId", "==", req.user.uid)
      .get();

    let total = 0;
    let viewed = 0;
    let unread = 0;

    snapshot.forEach(doc => {
      total += 1;
      const data = doc.data();
      if (data.viewed) viewed += 1;
      else unread += 1;
    });

    res.json({ total, viewed, unread });
  } catch (error) {
    console.error("Error fetching application summary:", error);
    res.status(500).send("Failed to fetch summary");
  }
});

// GET /employer/approved-students
router.get("/approved-students", verifyEmployerSimple, async (req, res) => {
  try {
    const snapshot = await admin.firestore()
      .collection("skills")
      .where("verified", "==", "approved")
      .get();

    const studentMap = new Map();

    for (const doc of snapshot.docs) {
      const skill = doc.data();
      const studentId = skill.ownerId;

      if (!studentId) continue;

      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, []);
      }

      const currentSkills = studentMap.get(studentId);
      if (Array.isArray(currentSkills)) {
        currentSkills.push({ id: doc.id, ...skill });
      } else {
        studentMap.set(studentId, [{ id: doc.id, ...skill }]);
      }
    }

    const results = [];

    for (const [studentId, skills] of studentMap.entries()) {
      const studentDoc = await admin.firestore().doc(`users/${studentId}`).get();
      if (!studentDoc.exists) continue;

      const student = studentDoc.data();

      results.push({
        studentId,
        studentName: student.name || "Unknown",
        email: student.email || "",
        customUid: student.customUid || "",
        schoolId: student.schoolId || "",
        major: student.major || "",
        skills: Array.isArray(skills) ? skills : [], // 确保为数组
      });
    }

    res.json(results);
  } catch (error) {
    console.error("Error loading approved students:", error);
    res.status(500).send("Failed to load approved students");
  }
});

// GET /employer/search-students
router.get("/search-students", verifyEmployerSimple, async (req, res) => {
  const { techSkills, softSkills } = req.query;
  const { uid } = req.user;
  
  try {
    console.log(`🔍 Backend: 雇主(${uid})搜索学生: techSkills=${techSkills || '无'}, softSkills=${softSkills || '无'}`);
    
    // 将技能字符串转换为数组
    const techSkillsArray = techSkills ? techSkills.split(',').map(s => s.trim().toLowerCase()) : [];
    const softSkillsArray = softSkills ? softSkills.split(',') : [];
    
    console.log(`📚 Backend: 技术技能: [${techSkillsArray.join(', ')}], 软技能: [${softSkillsArray.join(', ')}]`);
    
    // 如果没有指定技能，返回所有学生
    if (techSkillsArray.length === 0 && softSkillsArray.length === 0) {
      console.log(`🔍 Backend: 没有指定技能，返回所有学生`);
      const snapshot = await admin.firestore()
        .collection("users")
        .where("role", "==", "student")
        .limit(50) // 限制数量避免返回太多
        .get();
      
      const students = await Promise.all(snapshot.docs.map(async (doc) => {
        const userData = doc.data();
        
        // 获取学生技能
        const skillsSnapshot = await admin.firestore()
          .collection("skills")
          .where("ownerId", "==", doc.id)
          .get();
        
        const skills = skillsSnapshot.docs.map(skillDoc => ({
          id: skillDoc.id,
          ...skillDoc.data()
        }));
        
        // 获取学校名称
        let schoolName = null;
        if (userData.schoolId) {
          const schoolSnapshot = await admin.firestore()
            .collection("schools")
            .where("code", "==", userData.schoolId)
            .limit(1)
            .get();
            
          if (!schoolSnapshot.empty) {
            schoolName = schoolSnapshot.docs[0].data().name;
          }
        }
        
        return {
          id: doc.id,
          ...userData,
          schoolName,
          skills: skills.map(s => s.title || ''),
          skillObjects: skills
        };
      }));
      
      console.log(`✅ Backend: 返回${students.length}名学生`);
      return res.json(students);
    }
    
    // 如果指定了技能，查找符合条件的学生
    console.log(`🔍 Backend: 查询技能匹配的学生`);
    const skillSnapshot = await admin.firestore().collection("skills").get();
    
    // 过滤匹配技术技能的技能记录
    const matchedSkills = skillSnapshot.docs.filter(doc => {
      const skillData = doc.data();
      const skillTitle = (skillData.title || '').toLowerCase();
      
      // 检查是否匹配任何一个技术技能
      return techSkillsArray.some(tech => skillTitle.includes(tech));
    });
    
    console.log(`📊 Backend: 找到${matchedSkills.length}个匹配技能记录`);
    
    // 提取学生ID并去重
    const studentIds = [...new Set(matchedSkills.map(doc => doc.data().ownerId))];
    console.log(`👥 Backend: 找到${studentIds.length}个独立学生ID`);
    
    // 构建学生ID到技能的映射
    const studentSkillsMap = {};
    matchedSkills.forEach(doc => {
      const { ownerId, title } = doc.data();
      if (!studentSkillsMap[ownerId]) studentSkillsMap[ownerId] = [];
      if (title) studentSkillsMap[ownerId].push(title);
    });
    
    // 获取学生详细信息
    const students = [];
    for (const id of studentIds) {
      const userDoc = await admin.firestore().collection("users").doc(id).get();
      if (userDoc.exists && userDoc.data().role === 'student') {
        const userData = userDoc.data();
        
        // 获取学校名称
        let schoolName = null;
        if (userData.schoolId) {
          const schoolSnapshot = await admin.firestore()
            .collection("schools")
            .where("code", "==", userData.schoolId)
            .limit(1)
            .get();
            
          if (!schoolSnapshot.empty) {
            schoolName = schoolSnapshot.docs[0].data().name;
          }
        }
        
        // 获取所有技能对象
        const skillsSnapshot = await admin.firestore()
          .collection("skills")
          .where("ownerId", "==", id)
          .get();
        
        const skillObjects = skillsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        students.push({
          id: userDoc.id,
          ...userData,
          schoolName,
          skills: studentSkillsMap[userDoc.id] || [],
          skillObjects
        });
      }
    }
    
    console.log(`✅ Backend: return ${students.length} eligible students`);
    if (students.length > 0) {
      const sample = {...students[0]};
      delete sample.email; // 不打印敏感信息
      console.log(`📋 Backend: Sample student data:`, JSON.stringify(sample));
    }
    
    res.json(students);
  } catch (error) {
    console.error(`❌ Backend: Search for student failed:`, error.message);
    res.status(500).send("Failed to search students");
  }
});

// GET /employer/soft-skills
router.get("/soft-skills", verifyEmployerSimple, async (req, res) => {
  const { uid } = req.user;
  
  try {
    console.log(`🔍 Backend: employer(${uid})get a list of soft skills`);
    
    // 首先尝试从Firestore获取软技能
    try {
      const snapshot = await admin.firestore().collection("softSkills").get();
      
      if (!snapshot.empty) {
        const softSkills = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        }));
        
        console.log(`✅ Backend: from the database${softSkills.length}soft skills found`);
        return res.json(softSkills);
      }
    } catch (dbError) {
      console.log("📝 Backend: Database query failed, using hardcoded fallback data", dbError.message);
    }
    
    // 如果数据库没有数据，则返回硬编码的软技能列表
    const defaultSoftSkills = [
  { id: "communication", name: "Communication" },
  { id: "teamwork", name: "Teamwork" },
  { id: "problemSolving", name: "Problem-Solving Ability" },
  { id: "creativity", name: "Creativity" },
  { id: "leadership", name: "Leadership" },
  { id: "timeManagement", name: "Time Management" },
  { id: "adaptability", name: "Adaptability" },
  { id: "criticalThinking", name: "Critical Thinking" }
];
    
    console.log(`✅ Backend: return${defaultSoftSkills.length}default soft skills`);
    res.json(defaultSoftSkills);
  } catch (error) {
    console.error(`❌ Backend: acquire soft skills failed:`, error.message);
    res.status(500).send("Failed to fetch soft skills");
  }
});

export default router;
