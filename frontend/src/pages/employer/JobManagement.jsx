import React, { useEffect, useState } from "react";
import { Box, Button, Group, Title, Text, Loader, Center } from "@mantine/core";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useFireStoreUser } from "../../hooks/useFirestoreUser";
import { fetchJobs, verifyJobCompletion, deleteJob } from "../../services/jobService";
import JobTable from "../../components/JobTable";

export default function JobListPage() {
  const { user, role, token } = useAuth();
  const { userData } = useFireStoreUser(user);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  

  const loadJobs = async () => {
    try {
      const fetchedJobs = await fetchJobs(token);
      setJobs(fetchedJobs);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error("Error loading jobs:", err);
      setError("Failed to load jobs.");
      setJobs([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadJobs();
  }, [token]);

  const handleVerify = async (jobId) => {
    try {
      await verifyJobCompletion(jobId, token);
      await loadJobs(); // refresh the job list after verification
    } catch (err) {
      console.error("Error verifying job:", err);
      alert("Failed to verify job.");
    }
  };

  const handleEdit = (jobId) => {
    navigate(`/employer/edit-job/${jobId}`);
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await deleteJob(jobId, token);
      await loadJobs(); // refresh
    } catch (err) {
      console.error("Error deleting job:", err);
      alert("Failed to delete job.");
    }
  };

  if (!user || role !== "employer") return <Navigate to="/" />;

  if (loading) {
    return <Center mt="lg"><Loader /></Center>;
  }

  return (
      <Box style={{ flex: 1, padding: "20px" }}>
      <Group justify="space-between" align="center" mb="md">
        <Title order={2}>My Jobs</Title>
        <Button onClick={() => navigate("/employer/add-job")} variant="filled">
          + Post Job
        </Button>
      </Group>

      {jobs.length > 0 ? (
        <JobTable
          title="Job Listings"
          data={jobs}
          onVerify={handleVerify}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={loadJobs}
        />
      ) : (
        <Box>
          <Text>No jobs posted yet.</Text>
          {error && <Text color="red">{error}</Text>}
        </Box>
      )}
    </Box>
  );
}