import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Box, SimpleGrid, Title, Text, Group, Loader, Center } from "@mantine/core";
import axios from "axios";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../context/AuthContext";
import { useFireStoreUser } from "../../hooks/useFirestoreUser";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

import Notification from "../../components/Notification";
import UserTable from "../../components/UserTable";
import CourseList from "../../components/CourseList";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function SchoolHome() {
  const navigate = useNavigate();

  const { t } = useTranslation();
  const { user } = useAuth();
  const { userData, isLoading } = useFireStoreUser(user);

  const [courseList, setCourseList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [pendingSkillCount, setPendingSkillCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && userData?.schoolId) {
      fetchCourses();
      fetchPendingSkillCount();
      fetchStudents();
    }
  }, [user, userData]);

  const fetchCourses = async () => {
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${BASE_URL}/teacher/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourseList(res.data);
    } catch (err) {
      console.error("Failed to load courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingSkillCount = async () => {
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${BASE_URL}/teacher/pending-skills`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingSkillCount(res.data.length);
    } catch (err) {
      console.error("Failed to load pending skill count:", err);
    }
  };

  const fetchStudents = async () => {
    if (!userData?.schoolId) return;

    try {
      const q = query(
        collection(db, "users"),
        where("role", "==", "student"),
        where("schoolId", "==", userData.schoolId)
      );
      const snapshot = await getDocs(q);
      const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudentList(students);
    } catch (err) {
      console.error("Failed to load student list:", err);
    }
  };

  return (
    <Box flex={1} mt="30px">
      {isLoading || loading ? (
        <Center mt="lg"><Loader /></Center>
      ) : (
        <>
          <Group>
            <Title order={2}>
              {t("school.welcome")}, {userData?.name}
            </Title>
            <Text mt="10px" c="gray">
              {userData?.schoolId?.toUpperCase()} · {t(`role.${userData?.role}`)}
            </Text>
          </Group>

          <Notification
            userType={userData?.role}
            count={pendingSkillCount}
            label={t("school.skillLabel")}
            messagePrefix={t("school.reviewPrefix")}
            messageSuffix={t("school.reviewSuffix")}
          />

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <CourseList courseList={courseList} onClickMore={() => navigate('/school/manage-courses')}/>
            <UserTable title={t("school.myStudents")} studentList={studentList} />
          </SimpleGrid>
        </>
      )}
    </Box>
  );
}
