import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { addSkill, listSkills } from "../../services/skillService";
import { uploadToIPFS } from "../../ipfs/uploadToIPFS";
import {
  TextInput,
  Textarea,
  Select,
  FileInput,
  Button,
  Title,
  Stack,
  Paper,
  Text,
  Box,
} from "@mantine/core";
import StatusOverview from "../../components/StatusOverview";

export default function StudentRequestSkill() {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [form, setForm] = useState({ 
    title: "",
    description: "",
    level: "Beginner",
    file: null,
  });
  const [loading, setLoading] = useState(false);

  if (!user) return <Navigate to="/login" />;

  useEffect(() => {
    if(user){
    fetchSkills();
    console.log(skills)
    }
  }, [user]);

  const fetchSkills = async () => {
    try {
      const token = await user.getIdToken();
      const data = await listSkills(token);
      setSkills(data);
    } catch (err) {
      console.error("Failed to fetch skills:", err);
    } finally {
      setIsFetching(false)
    }
  };

  const handleAdd = async () => {
    const { title, description, level, file } = form;
    if (!title.trim() || !description.trim()) {
      alert("Title and Description are required.");
      return;
    }

  let attachmentCid = "";

  if (file) {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSizeMB = 5;

    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF or DOCX files are allowed.");
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      alert("File size exceeds 5MB.");
      return;
    }

    try {
      console.log("Uploading file...");
      attachmentCid = await uploadToIPFS(file); 
    } catch (error) {
      console.error("File upload failed:", error);
      alert("Failed to upload file to IPFS.");
      return;
    }
  }

    try {
      const token = await user.getIdToken();
      await addSkill(token, {
        title,
        description,
        level,
        createdAt: new Date().toISOString(),
        attachmentCid,
        userId: user.uid,
      });
      setForm({ title: "", description: "", level: "Beginner", file: null });
      fetchSkills(); 
    } catch (err) {
      console.error("Failed to add skill:", err);
      alert("Failed to save skill to Firestore");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} mt="30px">
      <Paper shadow="xs" p="md" radius="md" withBorder mb="lg">
        <Title order={3} mb="md">Add Skill</Title>
        <Stack>
          <TextInput
            label="Skill Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            autosize
            minRows={2}
            required
          />
          <Select
            label="Level"
            data={["Beginner", "Intermediate", "Advanced"]}
            value={form.level}
            onChange={(val) => setForm({ ...form, level: val })}
            required
          />
          <FileInput
            label="Attachment (PDF or DOCX, max 5MB)"
            value={form.file}
            onChange={(f) => setForm({ ...form, file: f })}
            accept=".pdf,.docx"
          />
          <Button onClick={handleAdd} loading={loading}>
            Submit Skill
          </Button>
        </Stack>
      </Paper>

      {!isFetching &&
      (skills.length === 0? <Text>No skills added yet.</Text> :  <StatusOverview skills={skills} />)}


    </Box>
  );
}
