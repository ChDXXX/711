import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Container,
  Flex,
  Grid,
  Box,
  MantineProvider,
  createTheme,
  Text,
  Select,
  Anchor,
  RingProgress,
  Button
} from "@mantine/core";

import AlertBox from "../../components/digitalskillwallet/AlertBox";
import BarChart from "../../components/digitalskillwallet/BarChart";
import HeaderCard from "../../components/digitalskillwallet/HeaderCard";
import PieChart from "../../components/digitalskillwallet/PieChart";
import SkillCard from "../../components/digitalskillwallet/SkillCard";
import VerifiedSkillCard from "../../components/digitalskillwallet/VerifiedSkillCard";

import classes from "../../style/DigitalSkillWallet.module.css";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getApp } from "firebase/app";
import { Link } from "react-router-dom";

const theme = createTheme({
  components: {
    Container: Container.extend({
      classNames: (_, { size }) => ({
        root: classes.responsiveContainer,
      }),
    }),
  },
});

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DigitalSkillWallet = () => {
  const { t } = useTranslation();
  const { user, role } = useAuth();

  const [email, setEmail] = useState("");
  const [customUid, setCustomUid] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [currentSchool, setCurrentSchool] = useState("");
  const [majorName, setMajorName] = useState("Unknown");
  const [verifiedSkills, setVerifiedSkills] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [showAlert, setShowAlert] = useState(true);
  const [softSkillMap, setSoftSkillMap] = useState({});

  useEffect(() => {
    if (!user || role !== "student") return;
    loadProfile();
    fetchVerifiedSkills();
    fetchSoftSkills();
  }, []);

  useEffect(() => {
    if (!selectedSkillId || verifiedSkills.length === 0) return;
    const skill = verifiedSkills.find((s) => s.id === selectedSkillId);
    setSelectedSkill(skill);
    fetchTeacherInfo(skill?.reviewedBy);
  }, [selectedSkillId, verifiedSkills]);

  const loadProfile = async () => {
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${BASE_URL}/student/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      setEmail(data.email);
      setCustomUid(data.customUid || "");
      setWalletAddress(data.walletAddress || "");
      setCurrentSchool(data.schoolId || "");
      if (data.major) setMajorName(data.majorName || "Unknown");
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  const fetchVerifiedSkills = async () => {
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${BASE_URL}/skill/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const verified = res.data.filter(
        (skill) => skill.verified === "approved" || skill.verified === "rejected"
      );
      setVerifiedSkills(verified);
      if (verified.length > 0) {
        setSelectedSkillId(verified[0].id);
      }
    } catch (error) {
      console.error("Failed to load verified skills:", error);
    }
  };

  const fetchTeacherInfo = async (teacherId) => {
    if (!teacherId) return;
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${BASE_URL}/user/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeacher(res.data);
    } catch (err) {
      setTeacher(null);
    }
  };

  const fetchSoftSkills = async () => {
    const db = getFirestore(getApp());
    const snap = await getDocs(collection(db, "soft-skills"));
    const map = {};
    snap.forEach((doc) => {
      map[doc.id] = doc.data().name;
    });
    setSoftSkillMap(map);
  };

  const calculateTotalScore = (skill) => {
    const soft = Object.values(skill?.softSkillScores || {}).reduce(
      (sum, val) => sum + (typeof val === "object" ? Number(val.score) || 0 : 0),
      0
    );
    const hard = Object.values(skill?.hardSkillScores || {}).reduce(
      (sum, val) => sum + (typeof val === "object" ? Number(val.score) || 0 : 0),
      0
    );
    return soft + hard;
  };

  const calculateMaxScore = (skill) => {
    const softMax = Object.keys(skill?.softSkillScores || {}).length * 5;
    const hardMax = Object.keys(skill?.hardSkillScores || {}).length * 5;
    return softMax + hardMax;
  };

  const getTotalPercent = (skill) => {
    const total = calculateTotalScore(skill);
    const max = calculateMaxScore(skill);
    return max === 0 ? 0 : (total / max) * 100;
  };

  const getRingColor = (skill) => {
    const percent = getTotalPercent(skill);
    if (percent >= 80) return "teal";
    if (percent >= 50) return "orange";
    return "red";
  };

  const renderPieChartData = () => {
    if (!selectedSkill?.softSkillScores) return [];
    return Object.entries(selectedSkill.softSkillScores).map(([id, value]) => ({
      label: softSkillMap[id] || id,
      value: typeof value === "object" ? Number(value.score) || 0 : 0,
    }));
  };

  const renderBarChartData = () => {
    if (!selectedSkill?.hardSkillScores) return [];
    return Object.entries(selectedSkill.hardSkillScores).map(([label, value]) => ({
      label: String(label),
      value: typeof value === "object" ? Number(value.score) || 0 : 0,
    }));
  };

  if (!user || role !== "student") return <Navigate to="/" />;


  if (!user || role !== "student") return <Navigate to="/" />;

  return (
    <MantineProvider theme={theme}>
      <Box flex={1} mt="30px">
        <Grid justify="center" gutter="xs">
          <Grid.Col span={10}>
            <HeaderCard
              userType="student"
              userData={{
                id: customUid || user?.email,
                name: user?.displayName || "Student",
                school: currentSchool,
                major: majorName,
                role: role,
                image: user?.photoURL || undefined,
              }}
            />
          </Grid.Col>

          <Grid.Col span={10}>
            <SkillCard title={t("wallet.selectSkillTitle")}>
              <Select
                label={t("wallet.chooseSkill")}
                placeholder={t("wallet.selectPlaceholder")}
                data={verifiedSkills.map((s) => ({
                  value: s.id,
                  label: `${s.title} (${s.courseCode})`,
                }))}
                value={selectedSkillId}
                onChange={setSelectedSkillId}
              />
            </SkillCard>
          </Grid.Col>

          {selectedSkill && selectedSkill.verified === "approved" && (
            <>
              <Grid.Col span={10}>
                <SkillCard title={t("wallet.overallScoreSummary")}>
                  <Flex justify="center">
                    <RingProgress
                      size={160}
                      thickness={16}
                      roundCaps
                      sections={[
                        {
                          value: getTotalPercent(selectedSkill),
                          color: getRingColor(selectedSkill),
                        },
                      ]}
                      label={
                        <Text size="xl" fw={700} ta="center">
                          {calculateTotalScore(selectedSkill)} / {calculateMaxScore(selectedSkill)}
                        </Text>
                      }
                    />
                  </Flex>
                </SkillCard>
              </Grid.Col>

              <Grid.Col span={10}>
                <SkillCard title={t("wallet.softSkillScores")}>
                  <PieChart data={renderPieChartData()} />
                </SkillCard>
              </Grid.Col>

              <Grid.Col span={10}>
                <SkillCard title={t("wallet.hardSkillScores")}>
                  <BarChart data={renderBarChartData()} />
                </SkillCard>
              </Grid.Col>
            </>
          )}

          {selectedSkill?.verified === "rejected" && (
            <Grid.Col span={10}>
              <SkillCard title={t("wallet.skillRejected")}>
                <Text color="red" fw={500}>
                  {t("wallet.skillRejected")}{" "}
                  {teacher?.email ? (
                    <Anchor href={`mailto:${teacher.email}`}>{teacher.name}</Anchor>
                  ) : (
                    t("wallet.unknown")
                  )}
                </Text>
              </SkillCard>
            </Grid.Col>
          )}

          <Grid.Col span={10}>
            <SkillCard title={t("wallet.myVerifiedSkills")}>
              <Flex wrap="wrap" gap="md">
                {verifiedSkills
                  .filter((s) => s.verified === "approved" && s.id !== selectedSkillId)
                  .map((skill) => (
                    <VerifiedSkillCard
                      key={skill.id}
                      skill={{
                        title: skill.title,
                        course: skill.courseTitle,
                        verifiedBy: teacher?.name || "Teacher",
                        score: skill.score || 0,
                        icon: null,
                      }}
                      checked={skill.visibleToEmployer || false}
                      onChange={(e) => {
                        console.log(
                          `Toggle employer visibility for ${skill.id}:`,
                          e.target.checked
                        );
                      }}
                    />
                  ))}
              </Flex>
            </SkillCard>
          </Grid.Col>

          <Grid.Col span={10}>
            {showAlert && (
              <AlertBox
                onClose={() => setShowAlert(false)}
                title={t("wallet.graduationReminderTitle")}
              >
                {t("wallet.graduationReminderMessage")}
              </AlertBox>
            )}
          </Grid.Col>
          <Grid.Col span={10}>
            <Flex justify="space-around" mt="lg">
              <Button
                fullWidth
                variant="light"
                component={Link}
                to="/student/applications"
                style={{ flex: 1, marginRight: "0.5rem" }}
              >
                My Applications
              </Button>
              <Button
                fullWidth
                variant="light"
                component={Link}
                to="/student/job"
                style={{ flex: 1, marginLeft: "0.5rem" }}
              >
                Job Board
              </Button>
              <Button
                fullWidth
                variant="light"
                component={Link}
                to="/student/assigned-jobs"
                style={{ flex: 1, marginLeft: "0.5rem" }}
              >
                Assigned Jobs
              </Button>
            </Flex>
          </Grid.Col>
        </Grid>
      </Box>
    </MantineProvider>
  );
};

export default DigitalSkillWallet;
