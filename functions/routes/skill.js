import express from "express";
import admin from "firebase-admin";

import { verifyStudent, verifyEmployer, verifyTeacher } from "../middlewares/verifyRole.js";
import { verifyStudentSimple, verifyRoleSimple } from "../middlewares/verifyRole-simple.js"; 

const router = express.Router();
const FieldValue = admin.firestore?.FieldValue ?? null;

// POST /skill/add
router.post("/add", verifyStudentSimple, async (req, res) => {
  const { role, uid } = req.user;
  const { courseId, attachmentCid, level, softSkills } = req.body;

  if (!courseId) return res.status(400).send("Missing courseId");

  if (!Array.isArray(softSkills) || softSkills.length === 0 || softSkills.length > 5) {
    return res.status(400).send("Please select 1 to 5 soft skills");
  }

  try {
    const courseRef = admin.firestore().doc(`courses/${courseId}`);
    const courseDoc = await courseRef.get();
    if (!courseDoc.exists) return res.status(404).send("Course not found");

    const courseData = courseDoc.data();
    const skillTemplate = courseData.skillTemplate || {};

    const existingSnap = await admin.firestore()
      .collection("skills")
      .where("courseId", "==", courseId)
      .where("ownerId", "==", uid)
      .get();

    const isFirstSubmission = existingSnap.empty;

    const docRef = await admin.firestore().collection("skills").add({
      ownerId: uid,
      courseId,
      courseCode: courseData.code || "",
      courseTitle: courseData.title || "",
      schoolId: courseData.schoolId || "",
      title: skillTemplate.skillTitle || "",
      description: skillTemplate.skillDescription || "",
      level: level || "Beginner",
      attachmentCid: attachmentCid || "",
      softSkills,
      hardSkillScores: null,
      softSkillScores: null,
      verified: "pending",
      reviewedBy: null,
      reviewedAt: null,
      note: "",
      score: null,
      createdAt: FieldValue ? FieldValue.serverTimestamp() : new Date().toISOString(),
    });

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

// GET /skill/list
router.get("/list", verifyStudentSimple, async (req, res) => {
  const { uid } = req.user;

  try {
    const db = admin.firestore();
    const userDoc = await db.doc(`users/${uid}`).get();
    const studentMajorId = userDoc.data()?.major;

    const majorDoc = await db.doc(`majors/${studentMajorId}`).get();
    const majorName = majorDoc.exists ? majorDoc.data().name : null;

    const skillSnap = await db
      .collection("skills")
      .where("ownerId", "==", uid)
      .orderBy("createdAt", "desc")
      .get();

    const softSkillDocs = await db.collection("soft-skills").get();
    const softSkillMap = {};
    softSkillDocs.forEach((doc) => {
      softSkillMap[doc.id] = doc.data().name;
    });

    const results = skillSnap.docs.map((doc) => {
      const data = doc.data();
      const resolvedSoftSkills = (data.softSkills || []).map((id) => softSkillMap[id] || id);
      return {
        id: doc.id,
        ...data,
        softSkills: resolvedSoftSkills,
        major: majorName,
      };
    });

    res.json(results);
  } catch (error) {
    console.error("Failed to fetch skills:", error.message);
    res.status(500).send("Failed to load skills");
  }
});


// GET /skill/approved
router.get("/approved", verifyRoleSimple(["employer"]), async (req, res) => {
  try {
    const snapshot = await admin.firestore()
      .collection("skills")
      .where("verified", "==", "approved")
      .get();

    const studentMap = new Map();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (!studentMap.has(data.ownerId)) {
        const userDoc = await admin.firestore().doc(`users/${data.ownerId}`).get();
        studentMap.set(data.ownerId, {
          studentId: data.ownerId,
          name: userDoc.exists ? userDoc.data().name : "Unknown",
          skills: [],
        });
      }
      studentMap.get(data.ownerId).skills.push({
        title: data.title,
        courseTitle: data.courseTitle,
      });
    }

    res.json(Array.from(studentMap.values()));
  } catch (error) {
    console.error("Error fetching approved students:", error.message);
    res.status(500).send("Failed to load approved students");
  }
});

// DELETE /skill/delete/:id
router.delete("/delete/:id", verifyStudentSimple, async (req, res) => {
  const { uid } = req.user;
  const skillId = req.params.id;

  try {
    const skillRef = admin.firestore().doc(`skills/${skillId}`);
    const skillDoc = await skillRef.get();

    if (!skillDoc.exists) return res.status(404).send("Skill not found");
    if (skillDoc.data().ownerId !== uid) return res.status(403).send("Unauthorized");

    await skillRef.delete();
    res.send("Skill deleted successfully");
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).send("Failed to delete skill");
  }
});


export default router;
