import express from "express";
import admin from "firebase-admin";

const router = express.Router();

// Middleware: verify teacher
async function verifyTeacher(req, res, next) {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  if (!idToken) return res.status(401).send("Unauthorized");

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const userDoc = await admin.firestore().doc(`users/${uid}`).get();
    if (!userDoc.exists) return res.status(403).send("User not found");

    const user = userDoc.data();
    if (user.role !== "school") {
      return res.status(403).send("Access denied. Only teachers allowed.");
    }

    req.user = { uid, ...user };
    next();
  } catch (err) {
    console.error("Teacher token verification failed:", err);
    return res.status(403).send("Invalid token");
  }
}

// GET /teacher/me
router.get("/me", verifyTeacher, (req, res) => {
  const { uid, email, schoolId, name } = req.user;
  res.json({ uid, email, name, schoolId, role: "teacher" });
});

// POST /teacher/verify-skill/:id 
router.post("/verify-skill/:id", verifyTeacher, async (req, res) => {
  const skillId = req.params.id;
  const { decision, note = "", softSkills = [], techSkills = [] } = req.body;

  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).send("Invalid decision. Must be 'approved' or 'rejected'.");
  }

  // 校验 rubric 内容
  if (decision === "approved") {
    const isValidSoftSkills = Array.isArray(softSkills) &&
      softSkills.length === 5 &&
      softSkills.every(s => typeof s.type === "string" && typeof s.score === "number" && s.score >= 0 && s.score <= 5);

    const isValidTechSkills = Array.isArray(techSkills) &&
      techSkills.every(t => typeof t.tag === "string" && typeof t.score === "number" && t.score >= 0 && t.score <= 5);

    if (!isValidSoftSkills || !isValidTechSkills) {
      return res.status(400).send("Invalid rubric data in softSkills or techSkills.");
    }
  }

  try {
    const skillRef = admin.firestore().doc(`skills/${skillId}`);
    const skillDoc = await skillRef.get();
    if (!skillDoc.exists) return res.status(404).send("Skill not found");

    const current = skillDoc.data();

    // 自动计算平均评分
    const rubricItems = [...softSkills, ...techSkills];
    const avgScore = decision === "approved" && rubricItems.length > 0
      ? Math.round(
          rubricItems.reduce((sum, item) => sum + item.score, 0) / rubricItems.length * 10
        ) / 10
      : null;

    const updateData = {
      verified: decision,
      reviewedBy: req.user.uid,
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      note,
      softSkills,
      techSkills,
      score: avgScore,
    };

    await skillRef.update(updateData);
    res.send("Skill reviewed successfully.");
  } catch (error) {
    console.error("Skill verification failed:", error);
    res.status(500).send("Failed to review skill.");
  }
});

// GET /teacher/my-courses
router.get("/my-courses", verifyTeacher, async (req, res) => {
  try {
    const courseSnapshot = await admin.firestore()
      .collection("courses")
      .where("createdBy", "==", admin.firestore().doc(`users/${req.user.uid}`))
      .get();

    const courses = [];

    for (const doc of courseSnapshot.docs) {
      const course = doc.data();
      const courseId = doc.id;

      const skillSnapshot = await admin.firestore()
        .collection("skills")
        .where("courseId", "==", courseId)
        .get();

      courses.push({
        id: courseId,
        ...course,
        studentCount: skillSnapshot.size,
      });
    }

    res.json(courses);
  } catch (err) {
    console.error("Failed to fetch teacher courses:", err);
    res.status(500).send("Error fetching courses");
  }
});

// GET /teacher/my-students
router.get("/my-students", verifyTeacher, async (req, res) => {
  try {
    const teacherRef = admin.firestore().doc(`users/${req.user.uid}`);
    const courseSnap = await admin.firestore()
      .collection("courses")
      .where("createdBy", "==", teacherRef)
      .get();

    const courseIds = courseSnap.docs.map(doc => doc.id);
    if (courseIds.length === 0) return res.json([]);

    const skillSnap = await admin.firestore()
      .collection("skills")
      .where("courseId", "in", courseIds)
      .get();

    const studentIds = Array.from(new Set(skillSnap.docs.map(doc => doc.data().ownerId)));
    const studentDocs = await Promise.all(studentIds.map(uid => admin.firestore().doc(`users/${uid}`).get()));

    const students = studentDocs.filter(doc => doc.exists).map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(students);
  } catch (err) {
    console.error("Failed to get students:", err);
    res.status(500).send("Internal error");
  }
});

// GET /teacher/pending-skills
router.get("/pending-skills", verifyTeacher, async (req, res) => {
  try {
    const snapshot = await admin.firestore()
      .collection("skills")
      .where("verified", "==", "pending")
      .get();

    const results = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const ownerDoc = await admin.firestore().doc(`users/${data.ownerId}`).get();

      if (ownerDoc.exists && ownerDoc.data().schoolId === req.user.schoolId) {
        const ownerData = ownerDoc.data();
        results.push({
          id: doc.id,
          ...data,
          studentMajor: ownerData.major,
          studentName: ownerData.name
        });
      }
    }

    res.json(results);
  } catch (err) {
    console.error("Error fetching pending skills:", err);
    res.status(500).send("Failed to fetch skills");
  }
});

export default router;