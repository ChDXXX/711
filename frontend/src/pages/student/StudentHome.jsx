import { useEffect, useState } from "react";
import {
  Box,
  Title,
  Text,
  Group,
  Loader,
  Center,
} from "@mantine/core";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useFireStoreUser } from "../../hooks/useFirestoreUser";
import { useTranslation } from "react-i18next";
import Notification from "../../components/Notification";

import StatusOverview from "../../components/StatusOverview"
import StudentProfile from "../../components/ProfileCard";

export default function StudentHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { userData, isLoading } = useFireStoreUser(user);

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user?.uid && userData?.schoolId) {
      fetchStudentSkills();
    }
  }, [user, userData]);

  const fetchStudentSkills = async () => {
    try {
      const skillSnap = await getDocs(
        query(collection(db, "skills"), where("ownerId", "==", user.uid))
      );

      const skillData = skillSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setSkills(skillData);
      setPendingCount(
        skillData.filter((s) => s.verified === "pending").length
      );
    } catch (err) {
      console.error("Failed to load skills:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} mt="30px">
      {isLoading || loading ? (
        <Center>
          <Loader />
        </Center>
      ) : (
        <>   
          <Group>
            <Title order={2}>
              {t("home.welcome")}, {userData?.name}
            </Title>
          </Group>

          <Notification
            userType={userData?.role}
            count={pendingCount}
            label="student.skillLabel"
            messagePrefix="student.reviewPrefix"
            messageSuffix="student.reviewSuffix"
          />

          <StudentProfile userData={userData}/>

          <StatusOverview skills={skills}/>
        </>
      )}
    </Box>
  );
}
