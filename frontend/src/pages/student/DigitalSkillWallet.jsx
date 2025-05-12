import axios from "axios";
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
} from "@mantine/core";

import cx from "clsx";
import AlertBox from "../../components/digitalskillwallet/AlertBox";
import BarChart from "../../components/digitalskillwallet/BarChart";
import HeaderCard from "../../components/digitalskillwallet/HeaderCard";
import PieChart from "../../components/digitalskillwallet/PieChart";
import SkillCard from "../../components/digitalskillwallet/SkillCard";
import classes from "./DigitalSkillWallet.module.css";

const theme = createTheme({
  components: {
    Container: Container.extend({
      classNames: (_, { size }) => ({
        root: cx({ [classes.responsiveContainer]: size === "responsive" }),
      }),
    }),
  },
});

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DigitalSkillWallet = () => {
  const { user, role } = useAuth();
  const [email, setEmail] = useState("");
  const [customUid, setCustomUid] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [currentSchool, setCurrentSchool] = useState("");
  const [schoolList, setSchoolList] = useState([]);
  const [newSchool, setNewSchool] = useState("");
  const [updating, setUpdating] = useState(false);
  const [verifiedSkills, setVerifiedSkills] = useState([]);
  const [courseStats, setCourseStats] = useState([]);
  const [softSkillStats, setSoftSkillStats] = useState([]);
  const [techSkillStats, setTechSkillStats] = useState([]);
  const [showAlert, setShowAlert] = useState(true);

  if (!user || role !== "student") return <Navigate to="/" />;

  useEffect(() => {
    loadProfile();
    loadSchoolOptions();
    fetchVerifiedSkills();
    fetchCoursePerformance();
  }, []);

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
      setNewSchool(data.schoolId || "");
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  const loadSchoolOptions = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/employer/schools`);
      setSchoolList(res.data);
    } catch (error) {
      console.error("Failed to load school list:", error);
    }
  };

  const fetchVerifiedSkills = async () => {
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${BASE_URL}/skill/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const verified = res.data.filter(skill => skill.verified === "approved");

      const softTitles = [
        "Creativity",
        "Communication",
        "Critical Analysis",
        "Collaboration",
        "Problem-Solving"
      ];

      const soft = verified.filter(s => softTitles.includes(s.title));
      const tech = verified.filter(s => !softTitles.includes(s.title));

      setVerifiedSkills(verified);
      setSoftSkillStats(soft);
      setTechSkillStats(tech);
    } catch (error) {
      console.error("Failed to load verified skills:", error);
    }
  };

  const fetchCoursePerformance = async () => {
    try {
      const token = await user.getIdToken();

      const skillsRes = await axios.get(`${BASE_URL}/skill/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const skills = skillsRes.data.filter(s => s.verified === "approved");

      const combined = skills.map(skill => ({
        courseTitle: skill.courseTitle,
        courseCode: skill.courseCode,
        score: skill.score,
        level: skill.level || "N/A"
      }));

      setCourseStats(combined);
    } catch (error) {
      console.error("Failed to fetch course performance:", error);
    }
  };

  const studentData = {
    id: user?.email || "SW123456",
    name: user?.username || "John Doe",
    company: "ABC University",
    role: role,
    image:
      user?.ImageUrl ||
      "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png",
  };

  return (
    <MantineProvider theme={theme}>
      <Box flex={1} mt="30px">
        <Grid justify="center" gutter="xs">
          <Grid.Col span={10}>
            <HeaderCard userType="student" userData={studentData} />
          </Grid.Col>

          <Grid.Col span={10}>
            <SkillCard title="Soft Skills Overview">
              <Flex wrap="wrap" gap="md" justify="center">
                {softSkillStats.map((skill, index) => (
                  <PieChart
                    key={index}
                    skill={{
                      title: skill.title,
                      score: skill.score,
                      courseCode: skill.courseCode,
                      level: skill.level,
                      color: "#82c91e"
                    }}
                  />
                ))}
              </Flex>
            </SkillCard>
          </Grid.Col>

          <Grid.Col span={10}>
            <SkillCard title="Technical Skill Overview">
              <BarChart data={techSkillStats.map(skill => ({
                title: skill.title,
                score: skill.score,
                avgScore: 0
              }))} />
            </SkillCard>
          </Grid.Col>

          <Grid.Col span={10}>
            <SkillCard title="My Score per Course">
              <BarChart data={courseStats.map(skill => ({
                title: skill.courseTitle,
                score: skill.score,
                avgScore: 0
              }))} />
            </SkillCard>
          </Grid.Col>

          <Grid.Col span={10}>
            {showAlert && (
              <AlertBox
                onClose={() => setShowAlert(false)}
                title="Graduation Reminder"
              >
                After graduation, your school email will be deactivated. Please use your
                personal email to log in!
              </AlertBox>
            )}
          </Grid.Col>
        </Grid>
      </Box>
    </MantineProvider>
  );
};

export default DigitalSkillWallet;
