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
  const { token, user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadJobs = async () => {
    try {
      const fetchedJobs = await fetchJobs(token);
      setJobs(fetchedJobs);
      setError(null);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to fetch jobs.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadJobs();
  }, [token]);

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
          const assignment = job.assignments?.find(
            (a) => a.studentId === user?.uid
          );

          return (
            <Box key={job.id} className={classes.jobcard}>
              <div className="job-content">
                <Text fw={500}>{job.title}</Text>
                <Text>{job.description}</Text>
              </div>

              <div className={classes.jobaction}>
                {assignment && (
                  <>
                    <Badge
                      className={classes.jobstatus}
                      color={
                        assignment.status === "accepted"
                          ? "green"
                          : assignment.status === "rejected"
                          ? "red"
                          : "gray"
                      }
                    >
                      Status: {assignment.status}
                    </Badge>

                    <div className={classes.jobbuttons}>
                      {assignment.status === "assigned" && (
                        <>
                          <Button
                            size="xs"
                            color="green"
                            onClick={async () => {
                              try {
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

                      {assignment.status === "accepted" && (
                        <Button
                          size="xs"
                          color="blue"
                          onClick={async () => {
                            try {
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
                )}
              </div>
            </Box>
          );
        })
      ) : (
        <Text>No jobs assigned.</Text>
      )}

      {error && <Text color="red">{error}</Text>}
    </Box>
  );
}
