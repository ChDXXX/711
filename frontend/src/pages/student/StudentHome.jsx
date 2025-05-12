import { useEffect, useState } from "react";
import { Box, Title, SimpleGrid, Group, Text, Loader, Center } from "@mantine/core";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

import { useAuth } from "../../context/AuthContext";
import { useFireStoreUser } from "../../hooks/useFirestoreUser";

import Notification from "../../components/Notification";
import StatusOverview from "../../components/StatusOverview";
import ActivityList from "../../components/ActivityList";
import UserTable from "../../components/UserTable";

export default function StudentHome() {
  const { user } = useAuth();
  const { userData, isLoading } = useFireStoreUser(user);

  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [teacherList, setTeacherList] = useState([]);
  const [courseData, setCourseData] = useState([]);

  useEffect(() => {
    if (user?.uid && userData?.schoolId) {
      fetchSkills();
      fetchCourses();
      fetchTeachers();
    }
  }, [user, userData]);

  const fetchSkills = async () => {
    try {
      const q = query(
        collection(db, "skills"),
        where("ownerId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const skillData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSkills(skillData);
    } catch (err) {
      console.error("Failed to fetch skills:", err);
    } finally {
      setLoadingSkills(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const q = query(
        collection(db, "courses"),
        where("schoolId", "==", userData?.schoolId || "")
      );
      const snapshot = await getDocs(q);

      const courseStats = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const courseId = doc.id;

        const studentsSnap = await getDocs(query(
          collection(db, "skills"),
          where("courseId", "==", courseId),
          where("verified", "==", "approved")
        ));

        const uniqueStudents = new Set(studentsSnap.docs.map(d => d.data().ownerId));

        return {
          courseName: data.title,
          courseCode: data.code,
          students: uniqueStudents.size
        };
      }));

      setCourseData(courseStats);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const q = query(
        collection(db, "users"),
        where("role", "==", "school"),
        where("schoolId", "==", userData?.schoolId || "")
      );
      const snapshot = await getDocs(q);
      const teachers = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          avatar: data.avatarUrl || "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-9.png",
          name: data.name,
          email: data.email,
          course: "-", // 可扩展为课程统计
          lastActive: data.lastLogin || "Unknown"
        };
      });
      setTeacherList(teachers);
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
    }
  };

  const unverifiedCount = skills.filter(skill => skill.verified === false).length;

  return (
    <Box flex={1} mt="30px">
      {isLoading ? (
        <Center mt="xl">
          <Loader />
        </Center>
      ) : (
        <>
          <Group>
            <Title order={2}>Welcome back, {userData?.name}</Title>
            <Text mt="10px" c="gray">
              {userData?.schoolId?.toUpperCase()} · {userData?.role}
            </Text>
            <Text mt="10px" c="gray">
              {userData?.schoolId?.toUpperCase()} · {userData?.role} · {userData?.major || "No major selected"}
            </Text>
          </Group>

          <Notification
            count={unverifiedCount}
            label="pending skills"
            messagePrefix="You currently have"
            messageSuffix="skills pending review."
          />

          {!loadingSkills && (
            <StatusOverview skills={skills} />
          )}

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="md">
            <ActivityList courseData={courseData} />
            <UserTable title="My Teachers" data={teacherList} />
          </SimpleGrid>
        </>
      )}
    </Box>
  );
}