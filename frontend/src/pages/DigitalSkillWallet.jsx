import axios from "axios";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Frontend-Amir
import { Container, Flex, Grid, MantineProvider, createTheme } from "@mantine/core";
import { IconActivity, IconBrandMessenger, IconBrandTeams, IconClipboardList, IconFilePlus } from "@tabler/icons-react";
import cx from "clsx";
import AlertBox from "./../components/AlertBox";
import BarChart from "./../components/BarChart";
import HeaderCard from "./../components/HeaderCard";
import PieChart from "./../components/PieChart";
import SkillCard from "./../components/SkillCard";
import VerifiedSkillCard from "./../components/VerifiedSkillCard";
import NormButton from "./../components/common/NormButton";
import classes from "./HomePage.module.css";

const theme = createTheme({
  components: {
    Container: Container.extend({
      classNames: (_, { size }) => ({
        root: cx({ [classes.responsiveContainer]: size === "responsive" })
      })
    })
  }
})

// Frontend-Amir

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

  if (!user || role !== "student") return <Navigate to="/" />;

  useEffect(() => {
    loadProfile();
    loadSchoolOptions();
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
      setSchoolList(res.data); // [{ code, name }]
    } catch (error) {
      console.error("Failed to load school list:", error);
    }
  };

  const updateSchool = async () => {
    if (!newSchool) {
      alert("Please select a school.");
      return;
    }
    if (newSchool === currentSchool) {
      alert("School unchanged.");
      return;
    }

    setUpdating(true);
    try {
      const token = await user.getIdToken();
      await axios.put(
        `${BASE_URL}/student/update-school`,
        { schoolId: newSchool },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("School updated successfully.");
      setCurrentSchool(newSchool);
    } catch (error) {
      alert("Failed to update school.");
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };
  
  // Frontend-Amir
  const [showAlert, setShowAlert] = useState(true)
  const [checkedSkills, setCheckedSkills] = useState({})
  
  // Data for pie chart
  const softSkillsData = [
      { soft_skill: "Creativity", percentage: 90, color: "#9CD3E8" },
      { soft_skill: "Communication", percentage: 80, color: "#F39393" },
      { soft_skill: "Critical Analysis", percentage: 85, color: "#FBD889" },
      { soft_skill: "Collaboration", percentage: 75, color: "#B1DB9E" },
      { soft_skill: "Problem-Solving", percentage: 95, color: "#879AD7" }
  ]
  
  // Data for bar chart
  const techSkillsData = [
      { tech_skill: "Java Script", hours: 150, color: "#9CD3E8" },
      { tech_skill: "HTML", hours: 120, color: "#F39393" },
      { tech_skill: "CSS", hours: 100, color: "#FBD889" },
      { tech_skill: "PHP", hours: 80, color: "#B1DB9E" }
  ]
  
  // Student data for Header
  const studentData = {
      id: user?.email || "SW123456",
      name: user?.username || "John Doe",
      company: "ABC University",
      role: role,
      image: user?.ImageUrl || "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png"
  }
  
  // Verified skills data
  const verifiedSkills = [
      {
        id: 1,
        title: "Communication",
        icon: <IconBrandMessenger size={32} color="#228be6" />,
        course: "ABC101",
        verifiedBy: "Prof. Smith",
        score: 4.5
      },
      {
        id: 2,
        title: "Teamwork",
        icon: <IconBrandTeams size={32} color="#228be6" />,
        course: "ABC101",
        verifiedBy: "Prof. Lee",
        score: 4.0
      }
  ]
  // Frontend-Amir

  return (
    // Frontend-Amir
    <MantineProvider theme={theme}>
        <Container size="responsive" bg="var(--mantine-color-white)">
          <Grid justify="center" gutter="xs">

            {/* Xi Xi */}
            <Grid.Col>
              <div style={{ padding: "20px" }}>
                <h2>Student Profile</h2>
                <p>Email: {email}</p>
                <p>Role: {role}</p>
                {customUid && <p>Student ID: {customUid}</p>}
                {walletAddress && <p>Wallet Address: {walletAddress}</p>}
                <p>Current School: {currentSchool || "Not set"}</p>

                <h4>Change School</h4>
                <select value={newSchool} onChange={(e) => setNewSchool(e.target.value)}>
                  <option value="">-- Select School --</option>
                  {schoolList.map((school) => (
                    <option key={school.code} value={school.code}>
                      {school.name}
                    </option>
                  ))}
                </select>
                <br />
                <button onClick={updateSchool} disabled={updating || newSchool === currentSchool}>
                  {updating ? "Updating..." : "Update School"}
                </button>
              </div>
            </Grid.Col>
            {/* Xi Xi */}
            <Grid.Col span={10} className={classes.heading}>
              Digital Skill Wallet
            </Grid.Col>

            {/* Heading component (Profile)*/}
            <Grid.Col span={10}>
              <HeaderCard userType="student" userData={studentData}/>
            </Grid.Col>

            {/* Soft Skills-Pie Chart */}
            <Grid.Col span={10}>
              <SkillCard title="Soft Skills">
                <Flex gap="md" justify="center" wrap="wrap">
                  {/* Pie Chart */}
                  {softSkillsData.map((skill, index) => (
                    <PieChart key={index} skill={skill} />
                  ))}
                </Flex>
              </SkillCard>
            </Grid.Col>

            {/* Technical Skills-Bar chart */}
            <Grid.Col span={10}>
              <SkillCard title="Technical Skills">
                <BarChart data={techSkillsData} />
              </SkillCard>
            </Grid.Col>

            {/* Verified Skills */}
            <Grid.Col span={10} className={classes.heading}>
              Verified Skills
            </Grid.Col>

            {/* Skills cards */}
            <Grid.Col span={10}>
              <Flex wrap="wrap" gap="lg" justify="flex-start">
                {verifiedSkills.map(skill => (
                  <VerifiedSkillCard
                    key={skill.id}
                    skill={skill}
                    checked={checkedSkills[skill.id] || false}
                    onChange={event =>
                      setCheckedSkills(prev => ({
                        ...prev,
                        [skill.id]: event.target.checked
                      }))
                    }
                  />
                ))}
              </Flex>
            </Grid.Col>

            {/* Three Buttons */}
            <Grid.Col span={10}>
              <Flex
                gap={{ base: "sm", sm: "lg" }}
                justify="stretch"
                align="stretch"
                direction="row"
                wrap="wrap"
              >
                <NormButton
                  icon={<IconFilePlus size={18} />}
                  label="Request Skill"
                  to="/"
                  // className={classes.actionButton}
                  style={{ flex: 1 }}
                />
                <NormButton
                  icon={<IconClipboardList size={18} />}
                  label="My Applications"
                  to="/"
                  // className={classes.actionButton}
                  style={{ flex: 1 }}
                />
                <NormButton
                  icon={<IconActivity size={18} />}
                  label="Activities"
                  to="/"
                  // className={classes.actionButton}
                  style={{ flex: 1 }}
                />
              </Flex>
            </Grid.Col>

            {/* Sticky Alert */}
            <Grid.Col span={10}>
              {showAlert && (
              <AlertBox
                onClose={() => setShowAlert(false)}
                title="Graduation Reminder"
              >
                After graduation, your school email will be deactivated.
                Please use your personal email to log in!
              </AlertBox>
              )}
            </Grid.Col>
          </Grid>
        </Container>
    </MantineProvider>
    // Frontend-Amir
  );
};

export default DigitalSkillWallet;