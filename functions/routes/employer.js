import express from "express";
import admin from "firebase-admin";

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

// GET /employer/soft-skills
router.get("/soft-skills", verifyEmployer, async (req, res) => {
  const { role } = req.user;

  // Only allow employers to access this
  if (role !== "employer") return res.status(403).send("Only employers can view soft skills");

  try {
    const snapshot = await admin.firestore().collection("soft-skills").get();
    
    const skills = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
    }));

    res.status(200).json(skills);
  } catch (error) {
    console.error("Error fetching soft skills:", error.message);
    res.status(500).send("Failed to retrieve soft skills");
  }
});

// GET /employer/student/:id
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

// GET /employer/student/:id/skills
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

// GET /employer/schools
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

// GET /employer/school/:schoolId/students
router.get("/school/:schoolId/students", verifyEmployer, async (req, res) => {
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
router.get("/students/skills/:skill", verifyEmployer, async (req, res) => {
  const { skill } = req.params;
  const jobSoftSkills = (req.query.softSkills || "").split(",").filter(Boolean);

  try {
    // Step 1: Load mapping collections
    const [schoolsSnap, majorsSnap, softSkillsSnap] = await Promise.all([
      admin.firestore().collection("schools").get(),
      admin.firestore().collection("majors").get(),
      admin.firestore().collection("soft-skills").get(),
    ]);

    const schoolMap = {};
    schoolsSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.code && data.name) {
        schoolMap[data.code] = data.name;
      }
    });

    const majorMap = {};
    majorsSnap.docs.forEach(doc => {
      majorMap[doc.id] = doc.data().name;
    });

    const softSkillMap = {};
    softSkillsSnap.docs.forEach(doc => {
      softSkillMap[doc.id] = doc.data().name;
    });

    // Step 2: Load all skills
    const skillSnapshot = await admin.firestore().collection("skills").get();
    const allSkills = skillSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Step 3: Filter only students who match the search term
    const matchedStudentIds = new Set();
    for (const s of allSkills) {
      if ((s.title || "").toLowerCase().includes(skill.toLowerCase()) && s.ownerId) {
        matchedStudentIds.add(s.ownerId);
      }
    }

    // Step 4: Group all skills by matched students
    const studentSkillsMap = new Map();
    for (const s of allSkills) {
      const studentId = s.ownerId;
      if (!studentId || !matchedStudentIds.has(studentId)) continue;

      if (!studentSkillsMap.has(studentId)) {
        studentSkillsMap.set(studentId, {
          skills: [],
          softSkillMatchCount: 0
        });
      }

      const softTitles = (s.softSkills || []).map(id => softSkillMap[id] || id);
      const softMatchCount = (s.softSkills || []).filter(id => jobSoftSkills.includes(String(id))).length;

      studentSkillsMap.get(studentId).skills.push({
        title: s.title,
        level: s.level || null,
        softSkillTitles: softTitles
      });

      studentSkillsMap.get(studentId).softSkillMatchCount += softMatchCount;
    }

    // Step 5: Fetch student info
    const students = [];
    for (const [studentId, skillData] of studentSkillsMap.entries()) {
      const userDoc = await admin.firestore().collection("users").doc(studentId).get();
      if (!userDoc.exists || userDoc.data().role !== "student") continue;

      const user = userDoc.data();

      students.push({
        id: studentId,
        studentId, // to be consistent
        name: user.name,
        email: user.email,
        customUid: user.customUid,
        schoolId: user.schoolId,
        schoolName: schoolMap[user.schoolId] || user.schoolId,
        major: user.major,
        majorName: majorMap[user.major] || user.major,
        skills: skillData.skills,
        softSkillMatchCount: skillData.softSkillMatchCount,
      });
    }

    // Step 6: Sort
    students.sort((a, b) => b.softSkillMatchCount - a.softSkillMatchCount);

    res.json(students);
  } catch (error) {
    console.error("Error searching students by skill:", error.message);
    res.status(500).send("Failed to search students");
  }
});






// GET /employer/search-students?techSkills=React,Node.js&softSkills=3,4,5
router.get("/search-students", verifyEmployer, async (req, res) => {
  const techSkillsFilter = (req.query.techSkills || "").split(",").filter(Boolean); // e.g. ["React", "Node.js"]
  const softSkillsFilter = (req.query.softSkills || "").split(",").filter(Boolean); // e.g. ["3", "4"]

  console.log("techSkillsFilter:", techSkillsFilter);
  console.log("softSkillsFilter:", softSkillsFilter);

  try {
    // Step 1: Load all schools, majors, and soft skill names
    const [schoolsSnap, majorsSnap, softSkillsSnap] = await Promise.all([
      admin.firestore().collection("schools").get(),
      admin.firestore().collection("majors").get(),
      admin.firestore().collection("soft-skills").get(),
    ]);

    const schoolMap = {};
    schoolsSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.code && data.name) {
        schoolMap[data.code] = data.name;
      }
    });

    const majorMap = {};
    majorsSnap.docs.forEach(doc => {
      const data = doc.data();
      majorMap[doc.id] = data.name;
    });

    const softSkillMap = {};
    softSkillsSnap.docs.forEach(doc => {
      softSkillMap[doc.id] = doc.data().name;
    });

    // Step 2: Load all skills
    const skillSnapshot = await admin.firestore().collection("skills").get();
    const allSkills = skillSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Step 3: Identify matched students
    const matchedStudentIds = new Set();
    for (const skill of allSkills) {
      const matchesTech =
        techSkillsFilter.length === 0 ||
        techSkillsFilter.some(filter =>
          (skill.title || "").toLowerCase().includes(filter.toLowerCase())
        );

      const matchesSoft =
        softSkillsFilter.length === 0 ||
        (skill.softSkills || []).some(s => softSkillsFilter.includes(String(s)));

      if (matchesTech && matchesSoft && skill.ownerId) {
        matchedStudentIds.add(skill.ownerId);
      }
    }

    if (matchedStudentIds.size === 0) {
      console.log("No students matched the filters");
      return res.json([]);
    }

    // Step 4: Group all skills by student (only for matched students)
    const studentSkillMap = new Map();
    for (const skill of allSkills) {
      const studentId = skill.ownerId;
      if (!studentId || !matchedStudentIds.has(studentId)) continue;

      if (!studentSkillMap.has(studentId)) {
        studentSkillMap.set(studentId, []);
      }

      studentSkillMap.get(studentId).push({
        ...skill,
        softSkillTitles: (skill.softSkills || []).map(id => softSkillMap[id] || id)
      });
    }

    // Step 5: Load student info and build response
    const results = [];

    for (const [studentId, skills] of studentSkillMap.entries()) {
      const studentDoc = await admin.firestore().doc(`users/${studentId}`).get();
      if (!studentDoc.exists) continue;

      const student = studentDoc.data();
      if (student.role !== "student") continue;

      results.push({
        studentId,
        name: student.name,
        email: student.email,
        customUid: student.customUid,
        schoolId: student.schoolId,
        schoolName: schoolMap[student.schoolId] || student.schoolId,
        major: student.major,
        majorName: majorMap[student.major] || student.major,
        skills,
      });
    }

    res.json(results);
  } catch (error) {
    console.error("Error searching students:", error.message);
    res.status(500).send("Failed to search students");
  }
});





// PATCH /employer/applications/:applicationId — 更新状态（通过 / 拒绝 / 面试）
router.patch("/applications/:applicationId", verifyEmployer, async (req, res) => {
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
router.get("/recent-applications", verifyEmployer, async (req, res) => {
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
router.get("/application-summary", verifyEmployer, async (req, res) => {
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
router.get("/approved-students", verifyEmployer, async (req, res) => {
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


export default router;