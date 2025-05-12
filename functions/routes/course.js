import express from "express";
import admin from "firebase-admin";

const router = express.Router();
const FieldValue = admin.firestore.FieldValue;

// verifyTeacher
async function verifyTeacher(req, res, next) {
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(401).send("Unauthorized");

    try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        const userDoc = await admin.firestore().doc(`users/${decoded.uid}`).get();
        if (!userDoc.exists) return res.status(403).send("User not found");

    const user = userDoc.data();
    if (user.role !== "school") {
      return res.status(403).send("Access denied. Only teachers allowed.");
    }

        req.user = { uid: decoded.uid, ...user };
        next();
    } catch (err) {
        console.error("Teacher token error:", err);
        return res.status(403).send("Invalid token");
    }
}

// POST /course/create
router.post("/create", verifyTeacher, async (req, res) => {
    const { title, code, major, skillTemplate, techTags } = req.body;

    if (!title || !code || !major || !skillTemplate?.skillTitle) {
        return res.status(400).send("Missing required fields");
    }

  try {
    const courseData = {
      title,
      code,
      major,
      techTags: Array.isArray(techTags) ? techTags : [],
      schoolId: req.user.schoolId,
      createdBy: admin.firestore().doc(`users/${req.user.uid}`),
      createdAt: FieldValue.serverTimestamp(),
      skillTemplate: {
        skillTitle: skillTemplate.skillTitle || "",
        skillDescription: skillTemplate.skillDescription || "",
      },
    };

    const ref = await admin.firestore().collection("courses").add(courseData);
    res.status(201).send({ id: ref.id });
  } catch (err) {
    console.error("Failed to create course:", err.message);
    res.status(500).send("Course creation failed");
  }
});

// DELETE /course/delete/:id
router.delete("/delete/:id", verifyTeacher, async (req, res) => {
  const courseId = req.params.id;

  try {
    await admin.firestore().doc(`courses/${courseId}`).delete();
    res.status(200).send("Course deleted.");
  } catch (err) {
    console.error("Delete course failed:", err);
    res.status(500).send("Failed to delete course.");
  }
});

export default router;
