// src/pages/DigitalSkillWallet.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Container,
  Flex,
  Group,
  Paper,
  Text,
  Title,
  Divider,
  useMantineTheme
} from "@mantine/core";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

import WalletSkillCard from "../../components/WalletSkillCard";
import classes from "../../style/DigitalSkillWallet.module.css";
import OverviewCharts from "../../components/OverviewCharts";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function DigitalSkillWallet() {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const { customId } = useParams();
  const uid = customId?.replace(/^S-/, "");

  const [userData, setUserData] = useState(null);
  const [majorMap, setMajorMap] = useState({});
  const [schoolMap, setSchoolMap] = useState({});
  const [skills, setSkills] = useState([]);

  const [selectedSkill, setSelectedSkill] = useState(null);
  const [softSkillMap, setSoftSkillMap] = useState({});

  const calculateTotalScore = (skill) => {
    const soft = Object.values(skill.softSkillScores || {}).reduce(
      (sum, v) => sum + (v.score || 0),
      0
    );
    const hard = Object.values(skill.hardSkillScores || {}).reduce(
      (sum, v) => sum + (v.score || 0),
      0
    );
    return soft + hard;
  };

  const calculateMaxScore = (skill) => {
    const softMax = Object.keys(skill.softSkillScores || {}).length * 5;
    const hardMax = Object.keys(skill.hardSkillScores || {}).length * 5;
    return softMax + hardMax;
  };

  const getTotalPercent = (skill) => {
    const total = calculateTotalScore(skill);
    const max = calculateMaxScore(skill);
    return max === 0 ? 0 : (total / max) * 100;
  };

  const getRingColor = (skill) => {
    const pct = getTotalPercent(skill);
    if (pct >= 80) return theme.colors.teal[6];
    if (pct >= 50) return theme.colors.orange[6];
    return theme.colors.red[6];
  };

  const renderPieChartData = () =>
    Object.entries(selectedSkill.softSkillScores || {}).map(([id, v]) => ({
      label: softSkillMap[id] || id,
      value: v.score || 0,
    }));


  useEffect(() => {
    if (!uid) return;
    fetchUserInfo();
    fetchMajors();
    fetchSchools();
    fetchStudentSkills();
    fetchSoftSkills();
  }, [uid]);

  const fetchUserInfo = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/${uid}`);
      setUserData(res.data);    } catch {
      console.error("Failed to load profile");
    }
  };

  const fetchMajors = async () => {
    const snap = await getDocs(collection(db, "majors"));
    const m = {};
    snap.forEach((d) => (m[d.id] = d.data().name));
    setMajorMap(m);
  };

  const fetchSchools = async () => {
    const snap = await getDocs(collection(db, "schools"));
    const m = {};
    snap.forEach((d) => (m[d.data().code] = d.data().name));
    setSchoolMap(m);
  };

  const fetchStudentSkills = async () => {
    try {
      const snap = await getDocs(
        query(collection(db, "skills"), where("ownerId", "==", uid))
      );
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSkills(all);
      // keep only approved or rejected
      const ver = all.filter((s) => s.verified === "approved" || s.verified === "rejected");
      setVerifiedSkills(ver);
      if (ver.length) setSelectedSkill(ver[0]);
    } catch {
      console.error("Failed to load skills");
    }
  };

  const fetchSoftSkills = async () => {
    const snap = await getDocs(collection(db, "soft-skills"));
    const m = {};
    snap.forEach((d) => (m[d.id] = d.data().name));
    setSoftSkillMap(m);
  };

  if (!userData) return <div>Loading…</div>;

  // 计算各级别数量
const levelDistribution = () => {
  const counts = skills.reduce(
    (acc, s) => {
      acc[s.level] = (acc[s.level] || 0) + 1;
      return acc;
    },
    {}
  );
  return [
    { label: 'Beginner',    value: counts['Beginner']    || 0 },
    { label: 'Intermediate', value: counts['Intermediate'] || 0 },
    { label: 'Advanced',    value: counts['Advanced']    || 0 },
  ];
};

// 统计所有软技能标签的出现次数
const softSkillCounts = () => {
  const counter = {};
  skills.forEach((s) => {
    (s.softSkills || []).forEach((tag) => {
      counter[tag] = (counter[tag] || 0) + 1;
    });
  });
  // 转成 BarChart 要的格式
  return Object.entries(counter).map(([label, value]) => ({ label, value }));
};


  return (
    <Box>
      {/* Banner */}
      <Box className={classes.banner}>
        <Container size="lg">
          <Flex direction="column" align="center" pt={56} pb={40}>
            <Avatar
              size={120}
              radius="xl"
              variant="filled"
              color="blue.4"
              style={{ border: "3px solid #fff" }}
            >
              {userData.name.slice(0, 2).toUpperCase()}
            </Avatar>
            <Title order={2} mt="sm" c="white">
              {userData.name}
            </Title>
            <Group>
              <Text fw={600} c="white">
                Wallet Address:
              </Text>
              <Text c="white">{userData.walletAddress}</Text>
            </Group>
            <Group gap="xs" mt="xs">
              <Paper px="xs" py={2} radius="sm" bg="white" c="blue" fw={500}>
                {schoolMap[userData.schoolId] || "N/A"}
              </Paper>
              <Paper px="xs" py={2} radius="sm" bg="white" c="blue" fw={500}>
                {majorMap[userData.major] || "N/A"}
              </Paper>
              <Paper px="xs" py={2} radius="sm" bg="white" c="blue" fw={500}>
                {userData.email}
              </Paper>
            </Group>
          </Flex>
        </Container>
      </Box>

      {/* Skills Overview */}
      <Container size="lg" py="xl">
        <Group align="center" gap="sm" mb="sm">
          <Text fw={600} size="lg">
            {t("wallet.skillsOverview")}
          </Text>
          <Divider size="xs" style={{ flex: 1 }} color="gray.3" />
        </Group>

        {/* Full list */}
        <WalletSkillCard skills={skills} />

        <Group align="center" gap="sm" mb="sm">
          <Text fw={600} size="lg">
            {t("wallet.chartsOverview")}
          </Text>
          <Divider size="xs" style={{ flex: 1 }} color="gray.3" />
        </Group> 

        <OverviewCharts skills={skills} softSkillMap={softSkillMap}/>

      </Container>
    </Box>
  );