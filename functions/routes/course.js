import express from "express";
import admin from "firebase-admin";
import { verifyTeacher, verifyRole } from "../middlewares/verifyRole.js";
import { verifyRoleSimple, verifyStudentSimple } from "../middlewares/verifyRole-simple.js";

const router = express.Router();
const FieldValue = admin.firestore.FieldValue;

// 解析专业名称
async function resolveMajorName(majorRef) {
  if (!majorRef?.path) return null;
  try {
    const doc = await majorRef.get();
    return doc.exists ? doc.data().name : null;
  } catch {
    return null;
  }
}

// POST /course/create
router.post("/create", verifyRoleSimple(["teacher", "school"]), async (req, res) => {
  const { title, code, major, skillTemplate, hardSkills } = req.body;

  if (!title || !code || !major || !skillTemplate?.skillTitle || !Array.isArray(hardSkills)) {
    return res.status(400).send("Missing required fields");
  }

  try {
    const courseData = {
      title,
      code,
      schoolId: req.user.schoolId,
      major: admin.firestore().doc(`majors/${major}`),
      createdBy: admin.firestore().doc(`users/${req.user.uid}`),
      createdAt: FieldValue.serverTimestamp(),
      studentCount: 0,
      hardSkills,
      skillTemplate: {
        skillTitle: skillTemplate.skillTitle,
        skillDescription: skillTemplate.skillDescription || "",
      },
    };

    const ref = await admin.firestore().collection("courses").add(courseData);
    res.status(201).send({ id: ref.id });
  } catch (err) {
    console.error("Course creation failed:", err);
    res.status(500).send("Course creation failed");
  }
});

// PUT /course/update/:id
router.put("/update/:id", verifyRoleSimple(["teacher", "school"]), async (req, res) => {
  const { title, code, major, skillTemplate, hardSkills } = req.body;
  const courseId = req.params.id;

  try {
    const courseRef = admin.firestore().doc(`courses/${courseId}`);
    const courseDoc = await courseRef.get();
    if (!courseDoc.exists) return res.status(404).send("Course not found");

    const courseData = courseDoc.data();
    const isCreator = courseData.createdBy?.path?.endsWith(req.user.uid);
    if (!isCreator) return res.status(403).send("You are not the creator");

    await courseRef.update({
      title: title || courseData.title,
      code: code || courseData.code,
      major: major ? admin.firestore().doc(`majors/${major}`) : courseData.major,
      hardSkills: Array.isArray(hardSkills) ? hardSkills : courseData.hardSkills,
      skillTemplate: {
        skillTitle: skillTemplate?.skillTitle || courseData.skillTemplate.skillTitle,
        skillDescription: skillTemplate?.skillDescription || courseData.skillTemplate.skillDescription,
      },
    });

    res.send("Course updated");
  } catch (err) {
    console.error("Course update failed:", err);
    res.status(500).send("Update failed");
  }
});

// DELETE /course/delete/:id
router.delete("/delete/:id", verifyRoleSimple(["teacher", "school"]), async (req, res) => {
  const courseId = req.params.id;

  try {
    const courseRef = admin.firestore().doc(`courses/${courseId}`);
    const courseDoc = await courseRef.get();
    if (!courseDoc.exists) return res.status(404).send("Course not found");

    const isCreator = courseDoc.data().createdBy?.path?.endsWith(req.user.uid);
    if (!isCreator) return res.status(403).send("You are not the creator");

    await courseRef.delete();
    res.send("Course deleted");
  } catch (err) {
    console.error("Course deletion failed:", err);
    res.status(500).send("Deletion failed");
  }
});

// GET /course/list-by-school
router.get("/list-by-school", verifyRoleSimple(["school", "student"]), async (req, res) => {
  const { role, schoolId, major } = req.user;
  if (!schoolId) return res.status(400).send("Missing schoolId");

  try {
    let query = admin.firestore().collection("courses").where("schoolId", "==", schoolId);
    if (role === "student") {
      const majorRef = admin.firestore().doc(`majors/${major}`);
      query = query.where("major", "==", majorRef);
    }

    const snapshot = await query.get();
    const results = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();
      const majorName = await resolveMajorName(data.major);
      return {
        id: doc.id,
        title: data.title,
        code: data.code,
        majorName,
        skillTemplate: data.skillTemplate,
        studentCount: data.studentCount || 0,
      };
    }));

    res.json(results);
  } catch (err) {
    console.error("Course fetch failed:", err);
    res.status(500).send("Failed to fetch courses");
  }
});

// GET /course/majors
router.get("/majors", verifyRoleSimple(["school", "student"]), async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("majors").get();
    const majors = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.send(majors);
  } catch (err) {
    console.error("Failed to fetch majors:", err);
    res.status(500).send("Failed to retrieve majors");
  }
});

// GET /course/soft-skills
router.get("/soft-skills", verifyRoleSimple(["school", "student"]), async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("soft-skills").get();
    const skills = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.send(skills);
  } catch (err) {
    console.error("Failed to fetch soft skills:", err);
    res.status(500).send("Failed to fetch soft skills");
  }
});

// GET /course/:courseId/details
router.get("/details/:courseId", verifyRoleSimple(["school", "student"]), async (req, res) => {
  const { courseId } = req.params;

  try {
    const doc = await admin.firestore().doc(`courses/${courseId}`).get();
    if (!doc.exists) return res.status(404).send("Course not found");

    const data = doc.data();
    const majorName = await resolveMajorName(data.major);

    res.json({
      id: doc.id,
      title: data.title,
      code: data.code,
      hardSkills: data.hardSkills || [],
      skillTemplate: data.skillTemplate || {},
      majorName,
    });
  } catch (err) {
    console.error("Failed to fetch course details:", err);
    res.status(500).send("Failed to fetch course details");
  }
});

export default router;
