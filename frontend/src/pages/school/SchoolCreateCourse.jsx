import { useState } from "react";
import {
  Box,
  Paper,
  Title,
  TextInput,
  Textarea,
  Button,
  Stack,
} from "@mantine/core";

export default function TeacherCreateSkillTemplate() {
  const [form, setForm] = useState({
    code: "",
    title: "",
    skillTitle: "",
    skillDescription: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const { code, title, skillTitle, skillDescription, level } = form;

    if (!code.trim() || !title.trim() || !skillTitle.trim() || !skillDescription.trim()) {
      alert("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      // TODO: 替换成你的 API 调用函数（例如 createSkillTemplate(form)）
      console.log("Submitting skill template:", form);
      alert("Submitted successfully (fake submission)");
    } catch (err) {
      console.error("Failed to submit:", err);
      alert("Failed to create skill template.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} mt="30px">
      <Paper shadow="xs" p="md" radius="md" withBorder>
        <Title order={3} mb="md">Create Course</Title>
        <Stack>
          <TextInput
            label="Course Code"
            placeholder="e.g. CS101"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
          />

          <TextInput
            label="Course Title"
            placeholder="e.g. Introduction to Computer Science"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <TextInput
            label="Skill Title"
            placeholder="e.g. Coding"
            value={form.skillTitle}
            onChange={(e) => setForm({ ...form, skillTitle: e.target.value })}
            required
          />

          <Textarea
            label="Skill Description"
            placeholder="Describe the skill objective..."
            value={form.skillDescription}
            onChange={(e) => setForm({ ...form, skillDescription: e.target.value })}
            autosize
            minRows={2}
            required
          />

          <Button onClick={handleSubmit} loading={loading}>
            Create Course
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
