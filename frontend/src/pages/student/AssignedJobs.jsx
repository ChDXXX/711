import React, { useEffect, useState } from "react";
import { Box, Title, Text, Loader, Center, Button, Group, Badge } from "@mantine/core";
import { fetchJobs, acceptJob, rejectJob, completeJob } from "../../services/jobService";
import { useAuth } from "../../context/AuthContext";
import classes from "./StudentStyle.module.css";


const getStatusColor = (status) => {
  switch (status) {
    case "accepted":
      return "#E8F5E9"; // greenish
    case "rejected":
      return "#FCE4EC"; // pink
    case "completed":
      return "#E3F2FD"; // light blue
    case "verified":
      return "#FFF3E0"; // light orange
    default:
      return "#f9f9f9"; // neutral grayish background
  }
};

const getBadgeColor = (status) => {
  switch (status) {
    case "accepted":
      return "green";
    case "rejected":
      return "red";
    case "completed":
      return "blue";
    case "verified":
      return "orange";
    default:
      return "gray";
  }
};

export default function AssignedJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadJobs = async () => {
    try {
      console.log("🔍 Fetching jobs...");
      console.log("User:", user ? "✅ Logged in" : "❌ Not logged in");
      
      if (!user) {
        console.error("❌ No user found, cannot fetch jobs");
        return;
      }
      
      const token = await user.getIdToken();  // 获取最新token
      console.log("🎫 Token obtained:", token ? "✅ Success" : "❌ Failed");
      console.log("🌐 API Base URL:", import.meta.env.VITE_API_BASE_URL);
      console.log("🌐 Environment:", import.meta.env.DEV ? 'Development' : 'Production');
      
      const fetchedJobs = await fetchJobs(token);
      setJobs(fetchedJobs);
      setError(null);
      console.log("✅ Jobs fetched successfully:", fetchedJobs.length, "items");
    } catch (err) {
      console.error("❌ Failed to fetch jobs:", err);
      console.error("Error details:", {
        message: err.message,
        code: err.code,
        config: err.config
      });
      setError("Failed to fetch jobs.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadJobs();
  }, [user]);

  if (loading) {
    return (
      <Center mt="lg">
        <Loader />
      </Center>
    );
  }

  return (
    <Box p="md">
      <Title order={2} mb="md">
        Assigned Jobs
      </Title>

      {jobs.length > 0 ? (
        jobs.map((job) => {
          // ✅ 适配后端数据结构：job直接包含studentId和status
          console.log("🔍 Processing job:", job.id, "studentId:", job.studentId, "status:", job.status);
          
          // 检查这个job是否分配给当前用户
          const isAssignedToMe = job.studentId === user?.uid;
          
          if (!isAssignedToMe) {
            console.log("⏭️ Skipping job", job.id, "not assigned to current user");
            return null; // 跳过不属于当前用户的工作
          }

          return (
            <Box key={job.id} className={classes.jobcard}>
              <div className="job-content">
                <Text fw={500}>{job.title}</Text>
                <Text>{job.description}</Text>
              </div>

              <div className={classes.jobaction}>
                <>
                  <Badge
                    className={classes.jobstatus}
                    color={
                      job.status === "accepted"
                        ? "green"
                        : job.status === "rejected"
                        ? "red"
                        : "gray"
                    }
                  >
                    Status: {job.status}
                  </Badge>

                  <div className={classes.jobbuttons}>
                    {job.status === "assigned" && (
                        <>
                          <Button
                            size="xs"
                            color="green"
                            onClick={async () => {
                              try {
                                const token = await user.getIdToken();
                                await acceptJob(job.id, token);
                                alert("Job accepted");
                                await loadJobs();
                              } catch (err) {
                                alert("Failed to accept job");
                                console.error(err);
                              }
                            }}
                          >
                            Accept
                          </Button>

                          <Button
                            size="xs"
                            color="red"
                            onClick={async () => {
                              try {
                                const token = await user.getIdToken();
                                await rejectJob(job.id, token);
                                alert("Job rejected");
                                await loadJobs();
                              } catch (err) {
                                alert("Failed to reject job");
                                console.error(err);
                              }
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                    {job.status === "accepted" && (
                      <Button
                        size="xs"
                        color="blue"
                        onClick={async () => {
                          try {
                            const token = await user.getIdToken();
                            await completeJob(job.id, token);
                            alert("Job completed");
                            await loadJobs();
                          } catch (err) {
                            alert("Failed to complete job");
                            console.error(err);
                          }
                        }}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </>
              </div>
            </Box>
          );
        }).filter(Boolean)
      ) : (
        <Text>No jobs assigned.</Text>
      )}

      {error && <Text color="red">{error}</Text>}
    </Box>
  );
}
