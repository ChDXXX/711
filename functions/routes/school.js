import express from "express";
import admin from "firebase-admin";
import { verifyRole } from "../middlewares/verifyRole.js";
import { verifyRoleSimple } from "../middlewares/verifyRole-simple.js";

const router = express.Router();

// 获取所有专业（允许 teacher 与 school）
router.get("/majors", verifyRoleSimple(["school", "teacher"]), async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("majors").get();
    const majors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(majors);
  } catch (err) {
    console.error("Error fetching majors:", err);
    res.status(500).json({ message: "Failed to fetch majors." });
  }
});

// 获取本校所有学生
router.get("/students", verifyRoleSimple(["school", "teacher"]), async (req, res) => {
  try {
    const snapshot = await admin.firestore()
      .collection("users")
      .where("role", "==", "student")
      .where("schoolId", "==", req.user.schoolId)
      .get();

    const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).send("Failed to retrieve students.");
  }
});

// 获取某个学生技能
router.get("/student/:id/skills", verifyRoleSimple(["school", "teacher"]), async (req, res) => {
  const studentId = req.params.id;

  try {
    const studentDoc = await admin.firestore().doc(`users/${studentId}`).get();
    if (!studentDoc.exists) return res.status(404).send("Student not found");

    const student = studentDoc.data();
    if (student.role !== "student" || student.schoolId !== req.user.schoolId) {
      return res.status(403).send("Access denied for students from other schools.");
    }

    const snapshot = await admin.firestore()
      .collection("skills")
      .where("ownerId", "==", studentId)
      .orderBy("createdAt", "desc")
      .get();

    const skills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(skills);
  } catch (err) {
    console.error("Error fetching skills:", err);
    res.status(500).send("Failed to retrieve skills.");
  }
});

// 获取本校教师
router.get("/teachers", verifyRoleSimple(["school", "teacher"]), async (req, res) => {
  try {
    const snapshot = await admin.firestore()
      .collection("users")
      .where("role", "==", "school")
      .where("schoolId", "==", req.user.schoolId)
      .get();

    const teachers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(teachers);
  } catch (err) {
    console.error("Error fetching teachers:", err);
    res.status(500).send("Failed to retrieve teachers.");
  }
});

// 获取本校课程
router.get("/courses", verifyRoleSimple(["school", "teacher"]), async (req, res) => {
  try {
    const snapshot = await admin.firestore()
      .collection("courses")
      .where("schoolId", "==", req.user.schoolId)
      .get();

    const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(courses);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).send("Failed to retrieve courses.");
  }
});

// 获取课程下所有学生技能记录（附带学生信息）
router.get("/course/:courseId/students", verifyRoleSimple(["school", "teacher"]), async (req, res) => {
  const courseId = req.params.courseId;

  try {
    const snapshot = await admin.firestore()
      .collection("skills")
      .where("courseId", "==", courseId)
      .orderBy("createdAt", "desc")
      .get();

    const skills = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const studentDoc = await admin.firestore().doc(`users/${data.ownerId}`).get();
      const student = studentDoc.exists ? studentDoc.data() : null;
      if (student && student.schoolId === req.user.schoolId) {
        skills.push({
          id: doc.id,
          ...data,
          student: {
            id: studentDoc.id,
            name: student.name,
            email: student.email,
            major: student.major,
          },
        });
      }
    }

    res.json(skills);
  } catch (err) {
    console.error("Error fetching course student skills:", err);
    res.status(500).send("Failed to retrieve course student data.");
  }
});

// 获取课程详情（包含创建教师信息）
router.get("/course/:courseId/details", verifyRoleSimple(["school", "teacher"]), async (req, res) => {
  const courseId = req.params.courseId;

  try {
    const courseRef = admin.firestore().doc(`courses/${courseId}`);
    const courseDoc = await courseRef.get();
    if (!courseDoc.exists) return res.status(404).send("Course not found");

    const course = courseDoc.data();

    const creatorRef = course.createdBy;
    const teacherDoc = await creatorRef.get();
    const teacher = teacherDoc.exists ? teacherDoc.data() : null;

    res.json({
      id: courseDoc.id,
      ...course,
      teacher: teacher ? {
        id: teacherDoc.id,
        name: teacher.name,
        email: teacher.email,
      } : null,
    });
  } catch (err) {
    console.error("Error fetching course details:", err);
    res.status(500).send("Failed to retrieve course details.");
  }
});

// 当前教师创建的课程
router.get("/my-courses", verifyRoleSimple(["school", "teacher"]), async (req, res) => {
  try {
    const snapshot = await admin.firestore()
      .collection("courses")
      .where("createdBy", "==", admin.firestore().doc(`users/${req.user.uid}`))
      .get();

    const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(courses);
  } catch (err) {
    console.error("Failed to fetch teacher courses:", err.message);
    res.status(500).send("Failed to retrieve courses.");
  }
});

// 获取当前学校的待审核技能
router.get("/pending-skills", verifyRoleSimple(["school", "teacher"]), async (req, res) => {
  try {
    const snapshot = await admin.firestore()
      .collection("skills")
      .where("verified", "==", "pending")
      .get();

    const pendingSkills = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      const studentDoc = await admin.firestore().doc(`users/${data.ownerId}`).get();
      if (!studentDoc.exists) continue;

      const studentData = studentDoc.data();
      if (studentData.schoolId !== req.user.schoolId) continue;

      pendingSkills.push({
        id: doc.id,
        ...data,
        student: {
          id: studentDoc.id,
          name: studentData.name,
          email: studentData.email,
          major: studentData.major,
        },
      });
    }

    res.json(pendingSkills);
  } catch (err) {
    console.error("Error fetching pending skills:", err);
    res.status(500).send("Failed to retrieve pending skills.");
  }
});

// 公共接口：获取任意学校学生（无身份验证）
router.get("/:schoolId/students", async (req, res) => {
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
    console.error("Public school-student fetch failed:", err);
    res.status(500).send("Failed to retrieve students.");
  }
});

export default router;
