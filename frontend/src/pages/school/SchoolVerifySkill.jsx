import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Box, Paper, Title, Text, Group, Button, TextInput,
  NumberInput, Textarea, Loader, Stack, Divider, Select, Collapse, SimpleGrid, Table
} from "@mantine/core";
import { IconChevronLeft } from '@tabler/icons-react';
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function SchoolVerifySkill() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({});
  const [softSkillMap, setSoftSkillMap] = useState({});
  const [majorMap, setMajorMap] = useState({});
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterMajor, setFilterMajor] = useState("");
  const skillRefs = useRef({});

  useEffect(() => {
    if (user) {
      fetchSoftSkills();
      fetchMajors();
      fetchPendingSkills();
    }
  }, [user]);

  useEffect(() => {
    filterSkillList();
  }, [skills, searchQuery, filterCourse, filterMajor]);

  const fetchSoftSkills = async () => {
    const token = await user.getIdToken();
    const res = await axios.get(`${BASE_URL}/course/soft-skills`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const map = {};
    res.data.forEach((s) => {
      map[s.id] = s.name;
    });
    setSoftSkillMap(map);
  };

    const fetchMajors = async () => {
      try {
        const token = await user.getIdToken();
        const snapshot = await axios.get(`${BASE_URL}/school/majors`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const map = {};
        snapshot.data.forEach((doc) => {
          map[doc.id] = doc.name;
        });
        setMajorMap(map);
      } catch (err) {
        console.error("Failed to fetch majors:", err);
      }
    };
  const fetchPendingSkills = async () => {
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${BASE_URL}/teacher/pending-skills`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const detailedSkills = await Promise.all(
        res.data.map(async (skill) => {
          let hardSkills = [];
          try {
            const courseRes = await axios.get(`${BASE_URL}/course/details/${skill.courseId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            hardSkills = courseRes.data.hardSkills || [];
          } catch {}
          return { ...skill, hardSkills };
        })
      );

      setSkills(detailedSkills);
    } catch (err) {
      console.error("Failed to load skills:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterSkillList = () => {
    const filtered = skills.filter(skill => {
      const nameMatch = skill.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        skill.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const courseMatch = !filterCourse || skill.courseCode === filterCourse;
      const majorMatch = !filterMajor || skill.student?.major === filterMajor;
      return nameMatch && courseMatch && majorMatch;
    });
    setFilteredSkills(filtered);
  };

  const handleScoreChange = (skillId, type, skillName, field, value) => {
    setFormState((prev) => {
      const current = prev[skillId] || {};
      const section = current[type] || {};
      return {
        ...prev,
        [skillId]: {
          ...current,
          [type]: {
            ...section,
            [skillName]: {
              ...section[skillName],
              [field]: value,
            },
          },
        },
      };
    });
  };

  const handleReview = async (skillId) => {
    const state = formState[skillId] || {};
    const { decision, hardSkillScores, softSkillScores, note } = state;

    if (!decision) {
      alert(t("teacher.review.alertDecision"));
      return;
    }

    if (decision === "approved" && (!hardSkillScores || !softSkillScores)) {
      alert(t("teacher.review.alertCompleteScores"));
      return;
    }

    try {
      const token = await user.getIdToken();
      await axios.put(`${BASE_URL}/teacher/review/${skillId}`, {
        verified: decision,
        hardSkillScores: decision === "approved" ? hardSkillScores : null,
        softSkillScores: decision === "approved" ? softSkillScores : null,
        note,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(t("teacher.review.success"));
      setFormState((prev) => {
        const updated = { ...prev };
        delete updated[skillId];
        return updated;
      });
      setSelectedSkillId(null);
      fetchPendingSkills();
    } catch (err) {
      console.error("Failed to submit review:", err);
      alert(t("teacher.review.error"));
    }
  };

  if (loading) return <Loader mt="md" />;

  return (
    <Box mt="30px">
      <Title order={2} mb="lg">{t("teacher.review.title")}</Title>

      {!selectedSkillId ? (
        <>
          <Group mb="md" grow>
            <TextInput
              placeholder={t("teacher.review.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select
              placeholder={t("teacher.review.courseFilter")}
              data={[...new Set(skills.map(s => s.courseCode))].map(code => ({ value: code, label: code }))}
              value={filterCourse}
              onChange={setFilterCourse}
              clearable
            />
            <Select
              placeholder={t("teacher.review.majorFilter")}
              data={[...new Set(skills.map(s => s.student?.major))].map(id => ({
                value: id,
                label: majorMap[id] || id
              }))}
              value={filterMajor}
              onChange={setFilterMajor}
              clearable
            />
          </Group>

          {filteredSkills.length === 0 ? (
            <Text>{t("teacher.review.noMatches")}</Text>
          ) : (
          <Table withBorder striped highlightOnHover>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>{t("profile.name")}</th>
                <th style={{ textAlign: "left" }}>{t("profile.id")}</th>
                <th style={{ textAlign: "left" }}>{t("profile.major")}</th>
                <th style={{ textAlign: "left" }}>{t("request.course")}</th>
                <th style={{ textAlign: "left" }}>{t("request.level")}</th>
                <th style={{ textAlign: "left" }}>{t("request.action")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredSkills.map(skill => (
                <tr key={skill.id}>
                  <td style={{ textAlign: "left" }}>{skill.student?.name || "Unknown"}</td>
                  <td style={{ textAlign: "left", wordBreak: "break-word" }}>{skill.student?.id}</td>
                  <td style={{ textAlign: "left" }}>{majorMap[skill.student?.major] || skill.student?.major}</td>
                  <td style={{ textAlign: "left" }}>{skill.courseCode}</td>
                  <td style={{ textAlign: "left" }}>{skill.level}</td>
                  <td style={{ textAlign: "left" }}>
                    <Button size="xs" onClick={() => setSelectedSkillId(skill.id)}>
                      {t("request.rubricTitle")}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          )}
        </>
      ) :  (
        skills.filter(s => s.id === selectedSkillId).map(skill => {
          const state = formState[skill.id] || {};
          const decision = state.decision;

      return (
        <Box key={skill.id} ref={(el) => (skillRefs.current[skill.id] = el)}>
          <Paper p="md" radius="md" shadow="xs" withBorder mb="lg">
            {/* 顶栏：标题 + Back */}
            <Group justify="space-between" align="center" mb="xs">
              <Title order={4}>
                {skill.title}{' '}
                <Text component="span" c="dimmed">
                  ({skill.level})
                </Text>
              </Title>
              <Button variant="light" onClick={() => setSelectedSkillId(null)}>
                <IconChevronLeft size={14} style={{ marginRight: 4 }} />
                Back
              </Button>
            </Group>

            <Text size="sm" c="dimmed" mb={4}>
              Course: {skill.courseTitle} ({skill.courseCode})
            </Text>
            <Text size="sm" mb="xs">
              Student: {skill.student?.name} ({skill.student?.id}) –{' '}
              {majorMap[skill.student?.major] || skill.student?.major}
            </Text>
            {skill.attachmentCid && (
              <Text size="sm" mb="xs">
                <a
                  href={`https://ipfs.io/ipfs/${skill.attachmentCid}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View&nbsp;Document
                </a>
              </Text>
            )}

            <Divider my="sm" />

            <Stack gap="sm">
              {/* 决策下拉框 */}
              <Select
                label="Approval Decision"
                value={state?.decision || ''}
                data={[
                  { value: 'approved', label: 'Approve' },
                  { value: 'rejected', label: 'Reject' },
                ]}
                onChange={(val) =>
                  setFormState((prev) => ({
                    ...prev,
                    [skill.id]: { ...prev[skill.id], decision: val },
                  }))
                }
              />

              {/* 只有 approve 时才展开打分区 */}
              <Collapse in={decision === 'approved'}>
                {/* Hard Skills */}
                <Title order={6} mt="sm" mb={4}>
                  Hard Skills
                </Title>
                {skill.hardSkills.length === 0 ? (
                  <Text size="sm" c="dimmed" mb="sm">
                    No hard skills defined for this course.
                  </Text>
                ) : (
                  <SimpleGrid cols={2} spacing="xs" mb="sm">
                    {skill.hardSkills.map((hard) => (
                      <NumberInput
                        key={hard}
                        label={hard}
                        min={0}
                        max={5}
                        precision={1}
                        value={state?.hardSkillScores?.[hard]?.score || ''}
                        onChange={(val) =>
                          handleScoreChange(skill.id, 'hardSkillScores', hard, 'score', val)
                        }
                      />
                    ))}
                  </SimpleGrid>
                )}

                {/* Soft Skills */}
                <Title order={6} mb={4}>
                  Soft Skills
                </Title>
                <SimpleGrid cols={2} spacing="xs">
                  {skill.softSkills?.map((softId) => (
                    <NumberInput
                      key={softId}
                      label={softSkillMap[softId] || softId}
                      min={0}
                      max={5}
                      precision={1}
                      value={state?.softSkillScores?.[softId]?.score || ''}
                      onChange={(val) =>
                        handleScoreChange(skill.id, 'softSkillScores', softId, 'score', val)
                      }
                    />
                  ))}
                </SimpleGrid>
              </Collapse>

              {/* Note & Submit */}
              <Textarea
                label="Feedback"
                value={state?.note || ''}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    [skill.id]: { ...prev[skill.id], note: e.target.value },
                  }))
                }
              />
              <Button color="green" onClick={() => handleReview(skill.id)}>
                Submit Review
              </Button>
            </Stack>
          </Paper>
        </Box>
      );

        })
      )}
    </Box>
  );
}
