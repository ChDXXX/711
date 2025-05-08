import React, { useEffect, useState } from "react";
import { Container, Group, Box,Flex, SimpleGrid ,Title, Button, Text } from "@mantine/core";
import { IconHome2, IconSettings } from '@tabler/icons-react';
import { Navigate, useNavigate, Outlet, useLocation  } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useFireStoreUser } from "../hooks/useFirestoreUser";
import { fetchJobs, assignJob, verifyJobCompletion } from "../services/jobService";

import HomeNavbar from "../components/HomeNavbar";
import JobTable from '../components/JobTable';

const EmployerPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); //
  const { user, role, token } = useAuth();
  const { userData, isLoading } = useFireStoreUser(user);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);

  const loadJobs = async () => {
    try {
      const fetchedJobs = await fetchJobs(token);
      setJobs(fetchedJobs);
      setError(null);
    } catch (err) {
      setError('Failed to load jobs. Please try again later.');
      console.error("Error loading jobs:", err);
      setJobs([]);
    }
  };
  
  useEffect(() => {
    loadJobs();
  
    if (location.state?.reload) {
      window.history.replaceState({}, document.title); // Clear state
    }
  }, [token, location.state?.reload]);
  
  
  const handleVerifyCompletion = async (jobId) => {
    try {
      await verifyJobCompletion(jobId);
      // Refresh jobs list to reflect the change
      const fetchedJobs = await fetchJobs();
      setJobs(fetchedJobs);
      alert('Job verified successfully!');
    } catch (err) {
      console.error('Failed to verify job:', err);
      alert('Failed to verify job. Please try again.');
    }
  };

  const navbarData = [
    { link: '.', label: 'Home', icon: IconHome2 },
    { link: 'add-job', label: 'Add Job', icon: IconSettings },
    { link: '', label: 'Settings', icon: IconSettings },
  ];

  // ❗ Block unauthorized access
  if (!user || role !== "employer") {
    return <Navigate to="/" />;
  }

  if (!Array.isArray(jobs) || jobs.length === 0) {
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
          <Box>
            {/* Only show job listings on the main employer page, not in child routes */}
            {window.location.pathname === '/employer' && (
              <div>
                <h2>Job Listings</h2>
                <p>No jobs available.</p>
                {error && <p style={{ color: 'red' }}>{error}</p>}
              </div>
            )}
            <Outlet />
          </Box>
        </Group>
      </Container>
    );
  }

  return (
    <Container size="xl" maw="1400px" pt="md">
      <Flex align="flex-start" gap="md">
        {/* Left: Sidebar - 30% */}
        <Box style={{ width: '30%' }}>
          <HomeNavbar
            userData={userData}
            navbarData={navbarData}
          />
        </Box>

        {/* Right: Content - 70% */}
        <Box style={{ width: '70%' }}>
          {location.pathname === '/employer' ? (
            <JobTable
              title="My Job Listings"
              data={jobs}
              onVerify={handleVerifyCompletion}
              onEdit={(jobId) => navigate(`/employer/edit-job/${jobId}`)}
              onRefresh={loadJobs}
            />
          ) : (
            <Outlet />
          )}
        </Box>
      </Flex>
    </Container>
  );
};

export default EmployerPage;