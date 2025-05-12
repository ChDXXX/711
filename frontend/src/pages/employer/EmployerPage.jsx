import React, { useEffect, useState } from "react";
import { Container, Group, Box } from "@mantine/core";
import { 
  IconHome2,
  IconCertificate,
  IconClipboardList,
  IconSettings,
  } from '@tabler/icons-react';
import { Navigate, Outlet } from "react-router-dom";  

import { useAuth } from "../../context/AuthContext";
import { useFireStoreUser } from "../../hooks/useFirestoreUser";

import HomeNavbar from "../../components/HomeNavbar";

const EmployerPage = () => {
  
  const { user, role } = useAuth();
  const { userData, isLoading } = useFireStoreUser(user);

  if (!user || role !== "employer") return <Navigate to="/" />;

  const navbarData = [
    { link: '.', label: 'Home', icon: IconHome2 },
    { link: 'request-skill', label: 'Post Jobs', icon: IconClipboardList },
    { link: '', label: 'Settings', icon: IconSettings },
  ];

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
        <Outlet/>
      </Group>
    </Container>

  );
};

export default EmployerPage;
