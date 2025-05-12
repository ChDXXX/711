// 省略 imports（与你之前一致）
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Box,
  Text,
  Title,
  Stack,
  Select,
  FileInput,
  Button,
  Paper,
  Group,
  Loader,
  Divider,
  Modal,
  MultiSelect,
} from "@mantine/core";
import axios from "axios";
import { uploadToIPFS } from "../../ipfs/uploadToIPFS";
import { listSkills, deleteSkill } from "../../services/skillService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function StudentRequestSkill() {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [form, setForm] = useState({ level: "Beginner", file: null, softSkills: [] });
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [userData, setUserData] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedMajor, setSelectedMajor] = useState("");

  const softSkillOptions = [
    "Creativity", "Communication", "Critical Analysis", "Collaboration", "Problem-Solving",
    "Adaptability", "Leadership", "Time Management", "Teamwork", "Work Ethic"
  ];

  useEffect(() => {
    if (user) loadStudentProfile();
  }, [user]);

  useEffect(() => {
    if (userData) {
      if (!userData.major) {
        setModalOpened(true);
      } else {
        fetchSkills();
        fetchCourses();
      }
    }
  }, [userData]);

  const loadStudentProfile = async () => {
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${BASE_URL}/student/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(res.data);
    } catch (error) {
      console.error("Failed to load student profile:", error);
    }
  };

  const fetchSkills = async () => {
    try {
      const token = await user.getIdToken();
      const data = await listSkills(token);
      setSkills(data);
    } catch (err) {
      console.error("Failed to fetch skills:", err);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${BASE_URL}/student/list-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourseList(res.data);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCourseId || !form.level) {
      alert("Please complete all required fields.");
      return;
    }

    if (form.softSkills.length !== 5) {
      alert("Please select exactly 5 soft skills.");
      return;
    }

    let attachmentCid = "";

    if (form.file) {
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const maxSizeMB = 5;

      if (!allowedTypes.includes(form.file.type)) {
        alert("Only PDF or DOCX files are allowed.");
        return;
      }

      if (form.file.size > maxSizeMB * 1024 * 1024) {
        alert("File size exceeds 5MB.");
        return;
      }

      try {
        setLoading(true);
        attachmentCid = await uploadToIPFS(form.file);
      } catch (error) {
        console.error("Upload error:", error);
        alert("File upload failed.");
        setLoading(false);
        return;
      }
    }

    try {
      const token = await user.getIdToken();
      await axios.post(`${BASE_URL}/skill/add`, {
        courseId: selectedCourseId,
        level: form.level,
        attachmentCid,
        softSkills: form.softSkills.map(type => ({
          type,
          score: null,
          comment: ""
        })),
        techTags: [], // 可扩展
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Skill submitted.");
      setForm({ level: "Beginner", file: null, softSkills: [] });
      setSelectedCourseId(null);
      fetchSkills();
    } catch (err) {
      console.error("Failed to submit skill:", err);
      alert("Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = await user.getIdToken();
      await deleteSkill(token, id);
      fetchSkills();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleSetMajor = async () => {
    if (!selectedMajor) {
      alert("Please select a major.");
      return;
    }

    try {
      const token = await user.getIdToken();
      await axios.put(`${BASE_URL}/student/update-major`, {
        major: selectedMajor,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Major set successfully.");
      setModalOpened(false);
      setUserData({ ...userData, major: selectedMajor });
      fetchCourses();
    } catch (err) {
      console.error("Failed to update major:", err);
      alert("Failed to update major.");
    }
  };

  if (!user) return <Navigate to="/login" />;

  return (
    <Box mt="30px">
      <Modal
        opened={modalOpened}
        onClose={() => {}}
        withCloseButton={false}
        title="Set Your Major"
        centered
        overlayProps={{ blur: 3 }}
      >
        <Stack>
          <Text>You must select your major before submitting a skill.</Text>
          <Select
            data={["IT", "Accounting", "Design", "Biology"]}
            placeholder="Select your major"
            value={selectedMajor}
            onChange={setSelectedMajor}
          />
          <Button onClick={handleSetMajor}>Confirm</Button>
        </Stack>
      </Modal>

      <Paper shadow="xs" p="md" withBorder mb="xl">
        <Title order={3} mb="md">Submit Skill</Title>
        <Stack>
          <Group position="apart">
            <Text size="sm" c="dimmed">
              Your Major: <strong>{userData?.major || "N/A"}</strong>
            </Text>
            <Button size="xs" variant="light" onClick={() => setModalOpened(true)}>
              Edit Major
            </Button>
          </Group>

          <Select
            label="Select Course"
            placeholder="Choose a course"
            value={selectedCourseId}
            onChange={setSelectedCourseId}
            data={courseList.map(c => ({ value: c.id, label: `${c.code} - ${c.title}` }))}
            required
          />

          <Select
            label="Skill Level"
            data={["Beginner", "Intermediate", "Advanced"]}
            value={form.level}
            onChange={(val) => setForm(prev => ({ ...prev, level: val }))}
          />

          <MultiSelect
            label="Select 5 Soft Skills"
            data={softSkillOptions}
            value={form.softSkills}
            onChange={(val) => {
              if (val.length <= 5) setForm(prev => ({ ...prev, softSkills: val }));
            }}
            description="You can select up to 5 skills only."
          />

          <FileInput
            label="Attachment (PDF or DOCX)"
            value={form.file}
            onChange={(file) => setForm(prev => ({ ...prev, file }))}
            accept=".pdf,.docx"
          />

          <Button onClick={handleSubmit} loading={loading}>Submit</Button>
        </Stack>
      </Paper>

      <Title order={4}>Your Skills</Title>
      {isFetching ? (
        <Loader />
      ) : skills.length === 0 ? (
        <Text>No skills submitted yet.</Text>
      ) : (
        <Stack mt="md">
          {skills.map(skill => (
            <Paper key={skill.id} withBorder p="md" radius="md">
              <Title order={5}>{skill.title} ({skill.level})</Title>
              <Text size="sm" c="gray">Course: {skill.courseTitle} ({skill.courseCode})</Text>
              <Text size="sm" mt="xs">{skill.description}</Text>

              {skill.attachmentCid && (
                <Text size="sm" mt="xs">
                  📎 <a href={`https://ipfs.io/ipfs/${skill.attachmentCid}`} target="_blank">View Attachment</a>
                </Text>
              )}

              <Divider my="sm" />
              <Text size="sm">Status: {
                skill.verified === "approved" ? "Approved" :
                skill.verified === "rejected" ? "Rejected" : " Pending"
              }</Text>
              {skill.score !== undefined && (
                <Text size="sm">Total Score: {skill.score}/5</Text>
              )}

              {skill.softSkills && skill.softSkills.length > 0 && (
                <Box mt="sm">
                  <Text fw={500}>Soft Skill Feedback</Text>
                  {skill.softSkills.map((s, idx) => (
                    <Text key={idx} size="sm">• {s.type}: {s.score ?? "-"}/5 — {s.comment || "No comment"}</Text>
                  ))}
                </Box>
              )}

              {skill.techSkills && skill.techSkills.length > 0 && (
                <Box mt="sm">
                  <Text fw={500}>Technical Skill Feedback</Text>
                  {skill.techSkills.map((s, idx) => (
                    <Text key={idx} size="sm">• {s.tag}: {s.score ?? "-"}/5 — {s.comment || "No comment"}</Text>
                  ))}
                </Box>
              )}

              <Group mt="xs">
                <Button size="xs" color="red" variant="light" onClick={() => handleDelete(skill.id)}>
                  Delete
                </Button>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
