import { Box, Title, SimpleGrid, Group, Text } from "@mantine/core";

import { useAuth } from "../../context/AuthContext";
import { useFireStoreUser } from "../../hooks/useFirestoreUser";

import Notification from "../../components/Notification"
import StatusOverview from "../../components/StatusOverview"
import ActivityList from "../../components/ActivityList";
import UserTable from "../../components/UserTable";

export default function StudentHome(){

  const { user, role } = useAuth();
  const { userData, isLoading } = useFireStoreUser(user);

  // My course list
  const courseData = [
    {
      courseName: 'Introduction to Computer Science',
      courseCode: 'CS101',
      students: 45,
      assignments: 5,
    },
    {
      courseName: 'Software Engineering Fundamentals',
      courseCode: 'SE201',
      students: 30,
      assignments: 3,
    },
    {
      courseName: 'Data Science Basics',
      courseCode: 'DS301',
      students: 28,
      assignments: 4,
    },
    {
      courseName: 'Data Science Basics',
      courseCode: 'DS301',
      students: 28,
      assignments: 4,
    },
  ];

  // My teacher list
  const teacherList = [
    {
      avatar: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-9.png',
      name: 'Alice Johnson',
      email: 'alice@student.edu',
      course: 'Computer Science',
      lastActive: '2 days ago',
    },
    {
      avatar: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-6.png',
      name: 'Bob Smith',
      email: 'bobsmith@student.edu',
      course: 'Software Engineering',
      lastActive: '10 days ago',
    },
    {
      avatar: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-10.png',
      name: 'Catherine Green',
      email: 'catherine@student.edu',
      course: 'Data Science',
      lastActive: 'Today',
    },
    {
      avatar: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png',
      name: 'David Brown',
      email: 'david@student.edu',
      course: 'Information Technology',
      lastActive: '5 days ago',
    },
    {
      avatar: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-3.png',
      name: 'Emma White',
      email: 'emmawhite@student.edu',
      course: 'Cybersecurity',
      lastActive: '20 days ago',
    },
  ];

  return(
    <Box flex={1} mt="30px">
      <Group>
        <Title order={2}>Welcome back, {userData?.name} </Title>
        <Text mt="10px" c="gray">{userData?.schoolId?.toUpperCase()} · {userData?.role}</Text>
      </Group>

      <Notification
        count={2}
        label="approved skills"
        messagePrefix="You currently have"
        messageSuffix="pending review."
      />

      {/* <StatusOverview /> */}

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <ActivityList 
        courseData={courseData}/>
        <UserTable 
        title="My Teachers"
        data={teacherList}/>
      </SimpleGrid>

    </Box> 
  )

}