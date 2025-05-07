import React, { useEffect, useState } from "react";
import { Container, Group, Box } from "@mantine/core";
import { IconHome2, IconSettings } from '@tabler/icons-react';
import { Navigate, useNavigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useFireStoreUser } from "../hooks/useFirestoreUser";
import { fetchJobs, assignJob, verifyJobCompletion } from "../services/jobService";

import HomeNavbar from "../components/HomeNavbar";

const EmployerPage = () => {
  const navigate = useNavigate();
  const { user, role, token } = useAuth();
  const { userData, isLoading } = useFireStoreUser(user);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const fetchedJobs = await fetchJobs(token);
        setJobs(fetchedJobs);
        setError(null);
      } catch (err) {
        setError('Failed to load jobs. Please try again later.');
        console.error("Error loading jobs:", err);
        setJobs([]); // Clear jobs on error or set to empty array if preferred
      }
    };
    loadJobs();
  }, [token]);

  const handleAssignJob = async (jobId, studentId) => {
    // For now, we'll use a prompt to get studentId. In a real app, this would be a more sophisticated UI.
    const promptedStudentId = studentId || prompt("Enter student ID to assign this job:");
    if (!promptedStudentId) return; // User cancelled or entered nothing

    try {
      await assignJob(jobId, promptedStudentId);
      // Refresh jobs list to reflect the change
      const fetchedJobs = await fetchJobs();
      setJobs(fetchedJobs);
      alert('Job assigned successfully!');
    } catch (err) {
      console.error('Failed to assign job:', err);
      alert('Failed to assign job. Please try again.');
    }
  };

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
              <ul>
                {jobs.map((job) => (
                  <li key={job.id}>
                    {job.title} - {job.location} - Status: {job.status}
                    {job.status === "pending" && !job.studentId && (
                      <button onClick={() => handleAssignJob(job.id)} style={{ marginLeft: '10px' }}>Assign Job</button>
                    )}
                    {job.status === "completed" && !job.verified && (
                      <button onClick={() => handleVerifyCompletion(job.id)} style={{ marginLeft: '10px' }}>Verify Completion</button>
                    )}
                  </li>
                ))}
              </ul>
              {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
          )}
          <Outlet />
        </Box>
      </Group>
    </Container>
  );
};

export default EmployerPage;