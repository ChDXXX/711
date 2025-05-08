const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

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

//  GET /employer/student/:id
router.get("/student/:id", verifyEmployer, async (req, res) => {
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

//  GET /employer/student/:id/skills
router.get("/student/:id/skills", verifyEmployer, async (req, res) => {
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

//  GET /employer/schools
router.get("/schools", async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("schools").get();
    const schools = snapshot.docs.map(doc => ({
      code: doc.data().code,
      name: doc.data().name,
    }));
    res.json(schools);
  } catch (err) {
    console.error("Error fetching schools:", err);
    res.status(500).send("Failed to fetch school list");
  }
});

// GET /employer/students/skills/:skill
router.get("/students/skills/:skill", verifyEmployer, async (req, res) => {
  const { skill } = req.params;

  try {
    // Step 1: Get all skills
    const skillSnapshot = await admin.firestore().collection("skills").get();

    // Step 2: Filter those matching the search term
    const matchedSkills = skillSnapshot.docs.filter(doc =>
      doc.data().title.toLowerCase().includes(skill.toLowerCase())
    );

    // Step 3: Get unique ownerIds (student UIDs)
    const ownerIds = [...new Set(matchedSkills.map(doc => doc.data().ownerId))];

    // Step 4: Build a map of studentId -> skill titles
    const studentSkillsMap = {};
    matchedSkills.forEach(doc => {
      const { ownerId, title } = doc.data();
      if (!studentSkillsMap[ownerId]) studentSkillsMap[ownerId] = [];
      studentSkillsMap[ownerId].push(title);
    });

    // Step 5: Fetch student user documents
    const students = [];
    for (const id of ownerIds) {
      const userDoc = await admin.firestore().collection("users").doc(id).get();
      if (userDoc.exists && userDoc.data().role === 'student') {
        const userData = userDoc.data();
        students.push({
          id: userDoc.id,
          ...userData,
          skills: studentSkillsMap[userDoc.id] || [] // attach actual skill titles
        });
      }
    }

    res.json(students);
  } catch (error) {
    console.error("Error searching students by skill:", error.message);
    res.status(500).send("Failed to search students");
  }
});





module.exports = router;