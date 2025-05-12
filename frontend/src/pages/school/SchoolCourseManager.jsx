import React, { useEffect, useState } from "react";
import {
  Box,
  TextInput,
  Textarea,
  Button,
  Paper,
  Title,
  Stack,
  Divider,
  Group,
  Text,
  Loader,
  Select,
  MultiSelect,
  Badge,
} from "@mantine/core";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const majorOptions = [
  { label: "Information Technology", value: "IT" },
  { label: "Accounting", value: "Accounting" },
  { label: "Biology", value: "Biology" },
  { label: "Design", value: "Design" },
];

const availableTags = [
  "JavaScript", "Python", "React", "Node.js", "MongoDB", "SQL", "Docker"
].map(tag => ({ label: tag, value: tag }));

export default function SchoolCourseManager() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    code: "",
    skillTitle: "",
    skillDescription: "",
    major: "",
    techTags: [],
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) loadCourses();
  }, [user]);

  const loadCourses = async () => {
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${BASE_URL}/teacher/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data);
    } catch (err) {
      console.error("Failed to load courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    const { title, code, skillTitle, skillDescription, major, techTags } = form;
    if (!title || !code || !skillTitle || !skillDescription || !major) {
      alert("All fields are required, including Major.");
      return;
    }

    try {
      setCreating(true);
      const token = await user.getIdToken();
      await axios.post(
        `${BASE_URL}/course/create`,
        {
          title,
          code,
          major,
          techTags,
          skillTemplate: {
            skillTitle,
            skillDescription,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Course created successfully.");
      setForm({
        title: "",
        code: "",
        skillTitle: "",
        skillDescription: "",
        major: "",
        techTags: [],
      });
      loadCourses();
    } catch (err) {
      console.error("Course creation failed:", err);
      alert("Failed to create course.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const token = await user.getIdToken();
      await axios.delete(`${BASE_URL}/course/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Course deleted.");
      loadCourses();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete course.");
    }
  };

  return (
    <Box mt="30px">
      <Title order={2} mb="lg">Course Management</Title>

      <Paper shadow="xs" p="md" withBorder mb="xl">
        <Stack>
          <TextInput
            label="Course Title"
            placeholder="e.g., Introduction to Computer Science"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
          <TextInput
            label="Course Code"
            placeholder="e.g., CS101"
            value={form.code}
            onChange={(e) => handleChange("code", e.target.value)}
          />
          <Select
            label="Major"
            placeholder="Select a major"
            data={majorOptions}
            value={form.major}
            onChange={(val) => handleChange("major", val)}
          />
          <MultiSelect
            label="Technical Skills (Tags)"
            placeholder="e.g., Python, React, MongoDB"
            data={availableTags}
            value={form.techTags}
            onChange={(val) => handleChange("techTags", val)}
            searchable
            creatable
            getCreateLabel={(query) => `+ Create ${query}`}
            onCreate={(query) => {
              const newTag = query.trim();
              if (!form.techTags.includes(newTag)) {
                handleChange("techTags", [...form.techTags, newTag]);
              }
              return newTag;
            }}
          />
          <TextInput
            label="Skill Title (Template)"
            placeholder="e.g., Problem Solving"
            value={form.skillTitle}
            onChange={(e) => handleChange("skillTitle", e.target.value)}
          />
          <Textarea
            label="Skill Description"
            placeholder="e.g., Demonstrate ability to solve complex programming tasks"
            value={form.skillDescription}
            onChange={(e) => handleChange("skillDescription", e.target.value)}
          />
          <Button onClick={handleCreate} loading={creating}>
            Create Course
          </Button>
        </Stack>
      </Paper>

      <Title order={3} mb="md">Your Courses</Title>
      {loading ? (
        <Loader />
      ) : courses.length === 0 ? (
        <Text>No courses created yet.</Text>
      ) : (
        courses.map((course) => (
          <Paper key={course.id} p="md" radius="md" withBorder mb="md">
            <Group position="apart">
              <Box>
                <Text fw={500}>{course.title}</Text>
                <Text size="sm" c="gray">{course.code} · Major: {course.major || "N/A"}</Text>
                <Text size="sm" mt="xs">Skill: {course.skillTemplate?.skillTitle}</Text>
                <Text size="sm" c="dimmed">{course.skillTemplate?.skillDescription}</Text>
                {course.techTags && course.techTags.length > 0 && (
                  <Group spacing="xs" mt="xs">
                    {course.techTags.map((tag, idx) => (
                      <Badge key={idx} color="teal" variant="light">{tag}</Badge>
                    ))}
                  </Group>
                )}
              </Box>
              <Button color="red" variant="light" onClick={() => handleDelete(course.id)}>
                Delete
              </Button>
            </Group>
          </Paper>
        ))
      )}
    </Box>
  );
}
