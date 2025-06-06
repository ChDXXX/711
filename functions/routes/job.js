import express from "express";
import admin from "firebase-admin";
import { verifyEmployerSimple, verifyStudentSimple } from "../middlewares/verifyRole-simple.js";
import { verifyRoleSimple } from "../middlewares/verifyRole-simple.js";

const router = express.Router();


/**
 * JOBS api
 *
 * Scenario:
 * - Employers can create jobs specifying title, description, price, location, and required skills.
 * - Employers can view the list of jobs they have created.
 * - Employers can assign a job to a student based on skills. (Searching student by skill is in employer.js /employer/students/skills/:skill)
 * - Students can view the list of jobs assigned to them.
 * - Students can accept or reject assigned jobs.
 * - After working on a job, students can mark the job as completed.
 * - Once the student marks a job as completed, the employer can verify the completion.
 * 
 * - Students and Employers can get a job detail by // GET /jobs/:jobId when they want to edit a job. 
 *
 * Job Document Structure:
 * - title: string
 * - description: string
 * - price: number
 * - location: string
 * - skills: array of strings
 * - employerId: string (UID of the employer)
 * - studentId: string (UID of the assigned student, nullable)
 * - status: string ("pending", "assigned", "accepted", "rejected", "completed")
 * - verified: boolean (true if employer verifies completion)
 * - createdAt: timestamp
 *
 * Status Workflow:
 * 1. Created → (status: "pending")
 * 2. Assigned → (studentId set, status becomes "assigned")
 * 3. Student Accepts → (status: "accepted")
 * 4. Student Rejects → (status: "rejected")
 * 5. Student Completes → (status: "completed")
 * 6. Employer Verifies → (verified: true)
 */

// GET /job/:jobId
router.get("/:jobId", verifyRoleSimple(["employer", "student"]), async (req, res) => {
  const { jobId } = req.params;
  const { uid, role } = req.user;

  try {
    const jobDoc = await admin.firestore().doc(`jobs/${jobId}`).get();
    if (!jobDoc.exists) return res.status(404).send("Job not found");

    const job = jobDoc.data();

    // Authorization
    if (role === "employer" && job.employerId !== uid) {
      return res.status(403).send("You do not own this job");
    }

    if (role === "student" && job.studentId !== uid) {
      return res.status(403).send("You are not assigned to this job");
    }

    let assignedUser = null;

    // ✅ If job is assigned (i.e., not pending), fetch assigned student info
    if (job.status !== 'pending' && job.studentId) {
      const studentDoc = await admin.firestore().doc(`users/${job.studentId}`).get();
      if (studentDoc.exists) {
        assignedUser = { id: studentDoc.id, ...studentDoc.data() };

        if (assignedUser.schoolId) {
            const snapshot = await admin.firestore()
            .collection("schools")
            .where("code", "==", assignedUser.schoolId)
            .limit(1)
            .get();
            
            if (!snapshot.empty) {
              const schoolDoc = snapshot.docs[0];
              assignedUser.schoolName = schoolDoc.data().name;
            }
        }
      }
    }

    // ✅ Include assignedUser in response if available
    res.status(200).json({
      id: jobDoc.id,
      ...job,
      assignedUser,
    });

  } catch (error) {
    console.error("Error fetching job:", error.message);
    res.status(500).send("Failed to retrieve job");
  }
});


// POST /job
router.post("/", verifyEmployerSimple, async (req, res) => {
  const { title, description, price, location, skills } = req.body;
  const { uid, role } = req.user;


  if (role !== "employer") return res.status(403).send("Only employers can create jobs");

  if (!title || !description || !price || !location || !skills) {
    return res.status(400).send("All fields are required");
  }

  try {
    const jobRef = await admin.firestore().collection("jobs").add({
      title,
      description,
      price,
      location,
      skills,
      employerId: uid,
      createdAt: new Date().toISOString(),
      status: "pending",
      verified: false
    });

    res.status(201).json({ jobId: jobRef.id });
  } catch (error) {
    console.error("Error creating job:", error.message);
    res.status(500).send("Failed to create job");
  }
});

// GET /job
router.get("/", verifyRoleSimple(["employer", "student"]), async (req, res) => {
  const { uid, role } = req.user;

  try {
    console.log(`🚀 Backend: GET /job called by ${role} (${uid})`);
    
    const query = admin.firestore().collection("jobs");
    console.log(`📊 Backend: Executing query for ${role}`);
    
    let snapshot;
    if (role === "employer") {
      // 雇主查询：按employerId过滤，有索引，性能好
      snapshot = await query.where("employerId", "==", uid).orderBy("createdAt", "desc").get();
    } else {
      // 学生查询：获取更多信息并增强调试
      console.log(`🔍 Backend: Student (${uid}) querying jobs`);
      
      // 先获取所有jobs，不再限制数量（避免学生看不到被分配的jobs）
      snapshot = await query.get();
      
      // 打印调试信息
      console.log(`📊 Backend: Total jobs in database: ${snapshot.docs.length}`);
      
      // 在内存中过滤属于该学生的jobs
      const allJobs = snapshot.docs;
      const studentJobs = allJobs.filter(doc => {
        const job = doc.data();
        const isAssigned = job.studentId === uid;
        console.log(`📋 Job ${doc.id}: studentId=${job.studentId}, current user=${uid}, match=${isAssigned}, status=${job.status}`);
        return isAssigned;
      });
      
      console.log(`✅ Backend: Found ${studentJobs.length} jobs for student from ${allJobs.length} total jobs`);
      
      // 返回匹配的jobs
      const jobs = studentJobs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`💼 Backend: Returning ${jobs.length} jobs for student: ${jobs.map(j => j.id).join(', ')}`);
      return res.json(jobs);
    }
    
    console.log(`📋 Backend: Found ${snapshot.docs.length} jobs for ${role}`);

    console.log(`🔄 Backend: Processing ${snapshot.docs.length} jobs...`);
    
    const jobs = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const job = { id: doc.id, ...doc.data() };
        console.log(`📝 Backend: Processing job ${job.id}, status: ${job.status}, studentId: ${job.studentId}`);

        // ✅ If assigned and not pending, fetch student + school info
        if (job.studentId && job.status !== "pending") {
          try {
            console.log(`👤 Backend: Fetching student info for job ${job.id}`);
            const studentDoc = await admin.firestore().doc(`users/${job.studentId}`).get();
            if (studentDoc.exists) {
              const studentData = studentDoc.data();
              job.assignedUser = { id: studentDoc.id, ...studentData };

              // ✅ Fetch school name using schoolId as code
              if (studentData.schoolId) {
                console.log(`🏫 Backend: Fetching school info for ${studentData.schoolId}`);
                const schoolSnapshot = await admin
                  .firestore()
                  .collection("schools")
                  .where("code", "==", studentData.schoolId)
                  .limit(1)
                  .get();

                if (!schoolSnapshot.empty) {
                  const schoolDoc = schoolSnapshot.docs[0];
                  job.assignedUser.schoolName = schoolDoc.data().name;
                }
              }
            }
          } catch (err) {
            console.error(`Failed to fetch assigned user or school for job ${job.id}:`, err.message);
          }
        }

        return job;
      })
    );

    console.log(`✅ Backend: Returning ${jobs.length} jobs`);
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error.message);
    res.status(500).send("Failed to retrieve jobs");
  }
});


// PUT /employer/job/:jobId
router.put("/:jobId", verifyEmployerSimple, async (req, res) => {
  const { jobId } = req.params;
  const { title, description, price, location, skills } = req.body;
  const { uid, role } = req.user;

  if (role !== "employer") return res.status(403).send("Only employers can edit jobs");

  try {
    const jobRef = admin.firestore().doc(`jobs/${jobId}`);
    const jobDoc = await jobRef.get();

    if (!jobDoc.exists) return res.status(404).send("Job not found");
    if (jobDoc.data().employerId !== uid) return res.status(403).send("Unauthorized");

    await jobRef.update({ title, description, price, location, skills });
    res.status(200).send("Job updated successfully");
  } catch (error) {
    console.error("Update error:", error.message);
    res.status(500).send("Failed to update job");
  }
});

// PUT /employer/job/:jobId/assign/:studentId
router.put("/:jobId/assign/:studentId", verifyEmployerSimple, async (req, res) => {
  const { jobId, studentId } = req.params;
  const { uid, role } = req.user;

  if (role !== "employer") return res.status(403).send("Only employers can assign jobs");

  try {
    const jobDoc = await admin.firestore().doc(`jobs/${jobId}`).get();
    if (!jobDoc.exists) return res.status(404).send("Job not found");

    const studentDoc = await admin.firestore().doc(`users/${studentId}`).get();
    if (!studentDoc.exists || studentDoc.data().role !== "student") {
      return res.status(404).send("Student not found");
    }

    await jobDoc.ref.update({ studentId, status: "assigned" });
    
    res.status(200).send("Job assigned successfully");
  } catch (error) {
    console.error("Assignment error:", error.message);
    res.status(500).send("Failed to assign job");
  }
});

// PUT /employer/job/:jobId/verify
router.put("/:jobId/verify", verifyEmployerSimple, async (req, res) => {
  const { jobId } = req.params;
  const { uid, role } = req.user;

  if (role !== "employer") return res.status(403).send("Only employers can verify");

  try {
    const jobDoc = await admin.firestore().doc(`jobs/${jobId}`).get();
    if (!jobDoc.exists) return res.status(404).send("Job not found");

    const jobData = jobDoc.data();
    if (jobData.employerId !== uid) return res.status(403).send("Unauthorized");
    if (jobData.status !== "completed") return res.status(400).send("Job not completed yet");

    await jobDoc.ref.update({ verified: true });
    res.status(200).send("Job verified successfully");
  } catch (error) {
    console.error("Verify error:", error.message);
    res.status(500).send("Failed to verify job");
  }
});

// PUT /student/job/:jobId/accept
router.put("/:jobId/accept", verifyStudentSimple, async (req, res) => {
  const { jobId } = req.params;
  const { uid, role } = req.user;

  if (role !== "student") return res.status(403).send("Only students can accept jobs");

  try {
    const jobDoc = await admin.firestore().doc(`jobs/${jobId}`).get();
    if (!jobDoc.exists) return res.status(404).send("Job not found");

    if (jobDoc.data().studentId !== uid) {
      return res.status(403).send("Not your assigned job");
    }

    await jobDoc.ref.update({ status: "accepted" });
    res.status(200).send("Job accepted");
  } catch (error) {
    console.error("Accept error:", error.message);
    res.status(500).send("Failed to accept job");
  }
});

// PUT /student/job/:jobId/reject
router.put("/:jobId/reject", verifyStudentSimple, async (req, res) => {
  const { jobId } = req.params;
  const { uid, role } = req.user;

  if (role !== "student") return res.status(403).send("Only students can reject jobs");

  try {
    const jobDoc = await admin.firestore().doc(`jobs/${jobId}`).get();
    if (!jobDoc.exists) return res.status(404).send("Job not found");

    if (jobDoc.data().studentId !== uid) {
      return res.status(403).send("Not your assigned job");
    }

    await jobDoc.ref.update({ status: "rejected" });
    res.status(200).send("Job rejected");
  } catch (error) {
    console.error("Reject error:", error.message);
    res.status(500).send("Failed to reject job");
  }
});

// PUT /student/job/:jobId/complete
router.put("/:jobId/complete", verifyStudentSimple, async (req, res) => {
  const { jobId } = req.params;
  const { uid, role } = req.user;

  if (role !== "student") return res.status(403).send("Only students can complete jobs");

  try {
    const jobDoc = await admin.firestore().doc(`jobs/${jobId}`).get();
    if (!jobDoc.exists) return res.status(404).send("Job not found");

    if (jobDoc.data().studentId !== uid) {
      return res.status(403).send("Not your assigned job");
    }

    await jobDoc.ref.update({ status: "completed" });
    res.status(200).send("Job marked as completed");
  } catch (error) {
    console.error("Complete error:", error.message);
    res.status(500).send("Failed to complete job");
  }
});

// DELETE /job/:jobId
router.delete("/:jobId", verifyEmployerSimple, async (req, res) => {
  const { jobId } = req.params;
  const { uid, role } = req.user;

  if (role !== "employer") return res.status(403).send("Only employers can delete jobs");

  try {
    const jobRef = admin.firestore().doc(`jobs/${jobId}`);
    const jobDoc = await jobRef.get();

    if (!jobDoc.exists) return res.status(404).send("Job not found");
    if (jobDoc.data().employerId !== uid) return res.status(403).send("Unauthorized");

    await jobRef.delete();
    res.status(200).send("Job deleted successfully");
  } catch (error) {
    console.error("Delete error:", error.message);
    res.status(500).send("Failed to delete job");
  }
});

export default router;