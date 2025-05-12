import express from "express";
import admin from "firebase-admin";

const router = express.Router();

// Middleware: Verify token and attach student info
async function verifyStudent(req, res, next) {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  if (!idToken) return res.status(401).send("Unauthorized");

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const userDoc = await admin.firestore().doc(`users/${uid}`).get();
    if (!userDoc.exists) return res.status(403).send("User not found");

    const userData = userDoc.data();
    if (userData.role !== "student") {
      return res.status(403).send("Access denied. Only students can use this endpoint.");
    }

    req.user = { uid, ...userData };
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(403).send("Invalid token");
  }
}

// GET /student/me
router.get("/me", verifyStudent, (req, res) => {
  const { uid, email, customUid, schoolId, role, major } = req.user;
  res.json({ uid, email, customUid, schoolId, role, major });
});

// GET /student/skills
router.get("/skills", verifyStudent, async (req, res) => {
  const { uid } = req.user;

  try {
    const snapshot = await admin.firestore()
      .collection("skills")
      .where("ownerId", "==", uid)
      .orderBy("createdAt", "desc")
      .get();

    const skills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(skills);
  } catch (error) {
    console.error("Failed to fetch student skills:", error.message);
    res.status(500).send("Error retrieving skills");
  }
});

// PUT /student/update-school
router.put("/update-school", verifyStudent, async (req, res) => {
  const { uid } = req.user;
  const { schoolId } = req.body;

  if (!schoolId || typeof schoolId !== "string") {
    return res.status(400).send("Invalid school ID.");
  }

  try {
    await admin.firestore().doc(`users/${uid}`).update({
      schoolId: schoolId.trim(),
    });
    res.status(200).send("School updated successfully.");
  } catch (error) {
    console.error("Error updating school:", error);
    res.status(500).send("Failed to update school.");
  }
});

// GET /student/list-courses
router.get("/list-courses", verifyStudent, async (req, res) => {
  try {
    const schoolId = req.user.schoolId;

    if (!schoolId) {
      console.warn("Missing schoolId in student profile:", req.user);
      return res.status(400).send("Missing schoolId in your profile.");
    }

    const snapshot = await admin.firestore().collection("courses").get();

    const courses = snapshot.docs
      .filter(doc => doc.data().schoolId === schoolId)
      .map(doc => ({
        id: doc.id,
        title: doc.data().title,
        code: doc.data().code,
        skillTemplate: doc.data().skillTemplate,
      }));

    res.json(courses);
  } catch (err) {
    console.error("Failed to fetch student courses:", err);
    res.status(500).send("Failed to load courses");
  }
});

// PUT /student/update-major
router.put("/update-major", verifyStudent, async (req, res) => {
  const { uid } = req.user;
  const { major } = req.body;

  if (!major || typeof major !== "string") {
    return res.status(400).send("Invalid major.");
  }

  try {
    await admin.firestore().doc(`users/${uid}`).update({
      major: major.trim(),
    });
    res.status(200).send("Major updated successfully.");
  } catch (error) {
    console.error("Error updating major:", error);
    res.status(500).send("Failed to update major.");
  }
});

export default router;
