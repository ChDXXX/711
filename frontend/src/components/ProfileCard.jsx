import { useEffect, useState } from "react";
import {
  Avatar, Box, Button, Group, Paper, Stack, Text, Title,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function StudentProfile(props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [majorMap, setMajorMap] = useState({});
  const [schoolMap, setSchoolMap] = useState({});

  useEffect(() => {
    if (user){
      fetchMajors()
      fetchSchools()
    }
  }, [user]);

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

  return (
    <Box>
      <Paper withBorder p="md" radius="md" shadow="xs">
        <Group align="flex-start" position="apart">

          {/* 中间信息 */}
          <Box sx={{ flex: 1 }}>
            <Text size="sm" c="dimmed" mb="xs">
              {t("profile.id")}: {props.userData?.customUid || "N/A"}
            </Text>

            <Group>
              <Text fw={500}>{t("profile.name")}:</Text>  
              <Text>{props.userData?.name || "N/A"}</Text>            
            </Group>


            <Group>
              <Text fw={500}>{t("profile.email")}: </Text>  
              <Text>{props.userData?.email || "N/A"}</Text>            
            </Group>

            {(props.userData?.role === "student" || props.userData?.role === "school") && (
              <Group>
                <Text fw={500}>{t("profile.school")}:{" "}</Text>   
                <Text>{schoolMap[props.userData?.schoolId] || "N/A"}</Text>             
              </Group>
            )}         

            {props.userData?.role === "student" && (
              <Group>
                <Text fw={500}>{t("profile.major")}:{" "}</Text>   
                <Text>{majorMap[props.userData?.major] || "N/A"}</Text>                 
              </Group>
            )}
          </Box>

        </Group>
      </Paper>
    </Box>
  );
}
