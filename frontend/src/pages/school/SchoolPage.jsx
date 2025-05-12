import React from "react";
import { Container, Group, Box} from "@mantine/core";
import { 
  IconHome2,
  IconFileCheck,
  IconLayoutGridAdd,
  IconSettings,
  } from '@tabler/icons-react';
import { useNavigate, Outlet } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useFireStoreUser } from "../../hooks/useFirestoreUser";

import HomeNavbar from "../../components/HomeNavbar";

const SchoolPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userData, isLoading } = useFireStoreUser(user);
  
  const navbarData = [
    { link: '.', label: 'Home', icon: IconHome2 },
    { link: 'verify-skill', label: 'Verify Skills', icon: IconFileCheck },
    { link: 'create-course', label: 'Create Course', icon: IconLayoutGridAdd },
    { link: '', label: 'Settings', icon: IconSettings },
];

  //  Block unauthorized access
  if( isLoading || !user) return <p>Loading user info...</p>;

  return (
    <Container size="xl" maw="1400px">
      <Group align="flex-start">
        {/* left */}
        <Box>
          <HomeNavbar 
          userData={userData}
          navbarData={navbarData}/>
        </Box>
        {/* right */}
        <Outlet />

      </Group>
    </Container>
  );
};

export default SchoolPage;