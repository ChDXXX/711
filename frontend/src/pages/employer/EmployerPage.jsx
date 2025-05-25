import React, { useEffect, useState } from "react";
import { Container, Group, Box } from "@mantine/core";
import { 
  IconHome2,
  IconCertificate,
  IconClipboardList,
  IconSettings,
  IconUsers
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
    { link: '.', labelKey: 'Home', icon: IconHome2 },
    { link: 'jobs-list', labelKey: 'Jobs List', icon: IconClipboardList },
    { link: 'students-list', labelKey: 'Students', icon: IconUsers },
    { link: 'settings', labelKey: 'Settings', icon: IconSettings }
    
  ];

  return (
  <Container size="xl" maw="1500px">
        <Group align="flex-start" noWrap>
          {/* Left: Navbar */}
          <Box >
            <HomeNavbar userData={userData} navbarData={navbarData} />
          </Box>

          {/* Right: Main content area */}
          <Box style={{ flex: 1, minHeight: "100vh", padding: "20px" }}>
            <Outlet />
          </Box>
        </Group>
    </Container>
  );
};

export default EmployerPage;