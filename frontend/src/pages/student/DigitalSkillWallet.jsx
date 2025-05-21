import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Container,
  Flex,
  Group,
  Paper,
  SimpleGrid,
  Text,
  Title,
  Divider,
  useMantineTheme,
} from "@mantine/core";
import { IconUser, IconBook2, IconSettings } from "@tabler/icons-react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

import classes from "../../style/DigitalSkillWallet.module.css";
import SkillCard from "../../components/digitalskillwallet/SkillCard";
import VerifiedSkillCard from "../../components/digitalskillwallet/VerifiedSkillCard";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function DigitalSkillWallet() {
  const { t } = useTranslation();
  const theme = useMantineTheme();

  const [majorMap, setMajorMap] = useState({});
  const [schoolMap, setSchoolMap] = useState({});

  /* 路由参数：去掉 S- 前缀 */
  const { studentId } = useParams();
  const uid = studentId?.replace(/^S-/, ""); // "1TIsuKulhSea..."

  const [userData, setUserData] = useState(null);

  /* 首次加载 */
  useEffect(() => {
    if(uid){
    fetchUserInfo()
    fetchMajors()
    fetchSchools()
    }
  }, [uid]);

  /* ---------- 拉接口 ---------- */
  const fetchUserInfo = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/${uid}`);
      setUserData(res.data);
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  const fetchMajors = async () => {
    const snapshot = await getDocs(collection(db, "majors"));
    const map = {};
    snapshot.forEach((doc) => {
      map[doc.id] = doc.data().name;
    });
    setMajorMap(map);
  };

  const fetchSchools = async () => {
    const snapshot = await getDocs(collection(db, "schools"));
    const map = {};
    snapshot.forEach((doc) => {
      map[doc.data().code] = doc.data().name;
    });
    setSchoolMap(map);  
  }

  if (!userData) return <div>Loading…</div>;


  return (
    <Box>
      {/* 顶部 Banner */}
      <Box className={classes.banner}>
        <Container size="lg">
          <Flex direction="column" align="center" pt={56} pb={40}>
            <Avatar
              size={120}
              radius="xl"
              variant="filled"        
              color="blue.4"          
              // 可选：如果想要白描边
              style={{ border: '3px solid #fff' }}
            >
              {userData.name.slice(0, 2).toUpperCase()}
            </Avatar>

            <Title order={2} mt="sm" c="white">
              {userData.name || "Student"}
            </Title>

            <Group>
              <Text fw={600} c="white">Wallet Address:</Text>
              <Text c="white">{userData.walletAddress}</Text>
            </Group>
            

            <Group gap="xs" mt="xs">
              <Paper px="xs" py={2} radius="sm" bg="white" c="blue" fw={500}>{schoolMap[userData.schoolId] || "N/A"}</Paper>
              <Paper px="xs" py={2} radius="sm" bg="white" c="blue" fw={500}>{majorMap[userData.major] || "N/A"}</Paper>
              <Paper px="xs" py={2} radius="sm" bg="white" c="blue" fw={500}>{userData.email}</Paper>
            </Group>

          </Flex>
        </Container>
      </Box>

      {/* 内容区：已验证技能列表 */}
      <Container size="lg" py="xl">

      <Group align="center" gap="sm" wrap="nowrap" mb="sm">
        {/* 标题文字 */}
        <Text fw={600} size="lg">
          Skills Overview
        </Text>

        {/* 占满剩余宽度的横线 */}
        <Divider
          size="xs"                       // 线条粗细
          style={{ flex: 1 }}             // 让 Divider 撑满余下空间
          color="gray.3"                  // 灰度，可按需换成 'gray.2' 'gray.4'
        />
      </Group>


      </Container>
    </Box>
  );
}
