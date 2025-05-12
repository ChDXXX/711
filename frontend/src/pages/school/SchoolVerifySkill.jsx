import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  Box,
  Paper,
  Title,
  Text,
  Group,
  Button,
  NumberInput,
  Textarea,
  Loader,
  Stack,
  Divider,
} from "@mantine/core";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function TeacherVerifyPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({});

  useEffect(() => {
    if (user) fetchPendingSkills();
  }, [user]);

  const fetchPendingSkills = async () => {
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${BASE_URL}/teacher/pending-skills`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSkills(res.data);
    } catch (err) {
      console.error("Failed to load skills:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRubricChange = (skillId, type, index, field, value) => {
    setFormState((prev) => {
      const current = prev[skillId] || { softSkills: [], techSkills: [] };
      const updated = [...(current[type] || [])];
      updated[index] = { ...(updated[index] || {}), [field]: value };
      return {
        ...prev,
        [skillId]: {
          ...current,
          [type]: updated,
        },
      };
    });
  };

  const handleReview = async (skillId, decision) => {
    const { softSkills = [], techSkills = [] } = formState[skillId] || {};

    if (
      decision === "approved" &&
      [...softSkills, ...techSkills].some(s => s.score == null || s.score < 0 || s.score > 5)
    ) {
      alert("All scores must be between 0 and 5.");
      return;
    }

    try {
      const token = await user.getIdToken();
      await axios.post(
        `${BASE_URL}/teacher/verify-skill/${skillId}`,
        { decision, softSkills, techSkills },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Skill ${decision === "approved" ? "approved" : "rejected"} successfully.`);
      fetchPendingSkills();
    } catch (err) {
      console.error("Review failed:", err);
      alert("Failed to submit review.");
    }
  };

  return (
    <Box mt="30px">
      <Title order={2} mb="lg">Skill Review Dashboard</Title>
      {loading ? (
        <Loader />
      ) : skills.length === 0 ? (
        <Text>No pending skills.</Text>
      ) : (
        skills.map((skill) => (
          <Paper key={skill.id} p="md" shadow="xs" radius="md" withBorder mb="md">
            <Title order={4}>{skill.title} ({skill.level})</Title>
            <Text c="dimmed" size="sm">
              Course: {skill.courseTitle} ({skill.courseCode})
            </Text>
            <Text size="sm" mt="xs">{skill.description}</Text>

            {skill.attachmentCid && (
              <Text mt="xs" size="sm">
                📎 <a href={`https://ipfs.io/ipfs/${skill.attachmentCid}`} target="_blank" rel="noreferrer">
                  View Document
                </a>
              </Text>
            )}

            <Divider my="sm" />

            <Stack>
                  <Title order={5}>Soft Skill Assessment</Title>
                  {(skill.softSkills || []).map((s, idx) => (
                    <Group key={idx} grow>
                      <Text>{s.type}</Text>
                      <NumberInput
                        placeholder="Score"
                        min={0}
                        max={5}
                        step={1}
                        value={formState[skill.id]?.softSkills?.[idx]?.score ?? ""}
                        onChange={(val) => handleRubricChange(skill.id, "softSkills", idx, "score", val)}
                      />
                      <Textarea
                        placeholder="Comment"
                        value={formState[skill.id]?.softSkills?.[idx]?.comment ?? ""}
                        onChange={(e) => handleRubricChange(skill.id, "softSkills", idx, "comment", e.target.value)}
                      />
                    </Group>
                  ))}

                  <Title order={5} mt="sm">Technical Skill Assessment</Title>
                  {(skill.techTags || []).map((tag, idx) => (
                    <Group key={idx} grow>
                      <Text>{tag}</Text>
                      <NumberInput
                        placeholder="Score"
                        min={0}
                        max={5}
                        step={1}
                        value={formState[skill.id]?.techSkills?.[idx]?.score ?? ""}
                        onChange={(val) => handleRubricChange(skill.id, "techSkills", idx, "score", val)}
                      />
                      <Textarea
                        placeholder="Comment"
                        value={formState[skill.id]?.techSkills?.[idx]?.comment ?? ""}
                        onChange={(e) => handleRubricChange(skill.id, "techSkills", idx, "comment", e.target.value)}
                      />
                    </Group>
                  ))}

              <Group mt="md">
                <Button color="green" onClick={() => handleReview(skill.id, "approved")}>Approve</Button>
                <Button color="red" variant="light" onClick={() => handleReview(skill.id, "rejected")}>Reject</Button>
              </Group>
            </Stack>
          </Paper>
        ))
      )}
    </Box>
  );
}
