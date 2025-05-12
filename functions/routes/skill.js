import express from "express";
import admin from "firebase-admin";

const router = express.Router();
const FieldValue = admin.firestore?.FieldValue ?? null;

// Middleware: 验证登录状态并附加用户信息
async function verifyToken(req, res, next) {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  if (!idToken) return res.status(401).send("Unauthorized");

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const userDoc = await admin.firestore().doc(`users/${decoded.uid}`).get();
    if (!userDoc.exists) return res.status(403).send("User document not found");

    req.user = {
      uid: decoded.uid,
      role: userDoc.data().role,
    };
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    return res.status(403).send("Invalid token");
  }
}

// POST /skill/add — 学生提交技能
router.post("/add", verifyToken, async (req, res) => {
  const { role, uid } = req.user;
  const { courseId, attachmentCid, level } = req.body;

    if (role !== "student") return res.status(403).send("Only students can add skills");
    if (!courseId) return res.status(400).send("Missing courseId");

  try {
    // 获取学生信息并验证 major
    const userDoc = await admin.firestore().doc(`users/${uid}`).get();
    const userData = userDoc.data();
    if (!userData.major) {
      return res.status(400).send("You must set your major before submitting a skill.");
    }

    // 获取课程数据
    const courseRef = admin.firestore().doc(`courses/${courseId}`);
    const courseDoc = await courseRef.get();
    if (!courseDoc.exists) return res.status(404).send("Course not found");

    const courseData = courseDoc.data();
    const skillTemplate = courseData.skillTemplate || {};
    const isSoftCourse = !Array.isArray(courseData.techTags) || courseData.techTags.length === 0;

    // 校验软技能
    if (isSoftCourse) {
      if (!Array.isArray(softSkills) || softSkills.length !== 5) {
        return res.status(400).send("You must select exactly 5 soft skills.");
      }
      for (const item of softSkills) {
        if (typeof item !== "object" || !item.type || typeof item.type !== "string") {
          return res.status(400).send("Invalid soft skill format.");
        }
      }
    }

    // 是否为首次提交
    const existingSnap = await admin.firestore()
      .collection("skills")
      .where("courseId", "==", courseId)
      .where("ownerId", "==", uid)
      .get();

    const isFirstSubmission = existingSnap.empty;

    // 构建技能文档
    const newSkill = {
      ownerId: uid,
      courseId,
      courseCode: courseData.code || "",
      courseTitle: courseData.title || "",
      schoolId: courseData.schoolId || "",
      major: courseData.major || "",
      title: skillTemplate.skillTitle || "",
      description: skillTemplate.skillDescription || "",
      level: level || "Beginner",
      attachmentCid: attachmentCid || "",
      verified: "pending",
      reviewedBy: null,
      reviewedAt: null,
      note: "",
      score: null,
      techTags: courseData.techTags || [],
      softSkills: isSoftCourse ? softSkills : [],
      techSkills: [], // 初始化空，后续老师评分使用
      createdAt: FieldValue ? FieldValue.serverTimestamp() : new Date().toISOString(),
    };

    const docRef = await admin.firestore().collection("skills").add(newSkill);

    // 如果是首次提交，则更新课程学生计数
    if (isFirstSubmission) {
      await courseRef.update({
        studentCount: FieldValue.increment(1),
      });
    }

        res.status(201).send({ id: docRef.id });
    } catch (error) {
        console.error("Error adding skill:", error);
        res.status(500).send("Failed to add skill");
    }
});

// GET /skill/list — 学生查看所有提交的技能
router.get("/list", verifyToken, async (req, res) => {
  const { uid, role } = req.user;
  const targetUid = req.query.uid || uid;

  if (role === "student" && targetUid !== uid) {
    return res.status(403).send("Students can only view their own skills");
  }

  try {
    const snapshot = await admin.firestore()
      .collection("skills")
      .where("ownerId", "==", targetUid)
      .orderBy("createdAt", "desc")
      .get();

    const skills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.send(skills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).send("Failed to fetch skills");
  }
});

// DELETE /skill/delete/:id — Delete skill (owner or admin)
router.delete("/delete/:id", verifyToken, async (req, res) => {
  const { role, uid } = req.user;
  const skillId = req.params.id;

  try {
    const skillDoc = await admin.firestore().collection("skills").doc(skillId).get();
    if (!skillDoc.exists) return res.status(404).send("Skill not found");

    const skillData = skillDoc.data();
    if (skillData.ownerId !== uid && role !== "admin") {
      return res.status(403).send("Unauthorized to delete this skill");
    }

    await admin.firestore().collection("skills").doc(skillId).delete();
    res.send("Skill deleted successfully");
  } catch (error) {
    console.error("Error deleting skill:", error);
    res.status(500).send("Failed to delete skill");
  }
});

export default router;
