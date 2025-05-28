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
    { link: 'jobs-list', label: 'Jobs List', icon: IconClipboardList },
    { link: '', label: 'Settings', icon: IconSettings },
    { link: 'messages', label: 'Messages', icon: IconCertificate },
  ];

  return (
    <Container size="xl" maw={1400} px="md">
      <Box
      style={{ display: "flex", minHeight: "100vh", overflowX: "hidden", gap: "20px" }}
        sx={(theme) => ({
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.md,

          [theme.fn.largerThan("md")]: {
            flexDirection: "row",
            alignItems: "flex-start",
          },
        })}
      >
        {/* Navbar */}
        <Box>
          <HomeNavbar userData={userData} navbarData={navbarData} />
        </Box>

        {/* Main content */}
        <Box style={{padding: "20px", maxWidth: "100%", overflowX: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Container>
  );
};

export default EmployerPage;