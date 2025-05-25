import {
  Card,
  Modal,
  Select,
  Avatar,
  Box,
  Group,
  Text,
  Button,
} from "@mantine/core";
import StudentDashboard from "./StudentDashboard";

function StudentCard({
  id,
  studentId,
  name,
  email,
  university,
  schoolName,
  image,
  major = "Not specified",
  majorName = "",
  passedCourses = [],
  softSkills = [],
  skills = [],
  setOpenedModalId = () => {},
  openedModalId,
  jobOptions = [],
  assignedJobs = {},
  handleJobChange = () => {},
  onSendJobApplication = () => {},
  status = null,
  readonly = false,
  highlight = '',
  showJobSelector = true,
  showAssignButton = true,
  showVerifyButton = false,
  onAssignClick = () => {},
  verifyJob = () => {},
  showTechnicalSkills = true
}) {
  const studentData = {
    id,
    name,
    email,
    university,
    schoolName,
    image,
    major,
    majorName,
    passedCourses,
    softSkills,
    skills,
  };

  const bgColors = ["#E3F2FD", "#FCE4EC", "#FFF3E0", "#E8F5E9"];
  const randomColor = bgColors[Math.floor(Math.random() * bgColors.length)];
  const selectedJobValue = assignedJobs[id] ?? null;
  const isModalOpen = openedModalId === studentId;

  return (
    <Card shadow="sm" radius="md" h="100%" withBorder style={{ maxWidth: 400 }}>
      <div
        style={{
          backgroundColor: randomColor,
          height: 80,
          borderRadius: "8px 8px 0 0",
        }}
      />
      <Avatar
        src={image || ''}
        size={80}
        radius={80}
        mx="auto"
        mt={-40}
        style={{ border: "4px solid white" }}
      >
        {name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()}
      </Avatar>

      <Box px="sm" mt="sm">
        <Text align="center" fw={700}>
          {name}
        </Text>

        <Box mt="sm">
          <Group>
            <Text fw={600}>University:</Text>
            <Text>{schoolName || university}</Text>
          </Group>
          <Group>
            <Text fw={600}>Major:</Text>
            <Text>{majorName || major}</Text>
          </Group>
        </Box>

        {showTechnicalSkills && 
        <Group mt="sm" align="start" spacing="xs" grow>
          <Box>
            <Text mb="-sm" fw={600}>
              Technical Skills
            </Text>
            <ul style={{ paddingLeft: 16 }}>
              {skills.map((s, i) => (
                <li key={i}>
                  <Text fw={500}>{s.title || s}</Text>
                  {Array.isArray(s.softSkillTitles) && s.softSkillTitles.length > 0 && (
                    <ul style={{ paddingLeft: 16 }}>
                      {s.softSkillTitles.map((ss, j) => (
                        <li key={j}>
                          <Text size="sm" c="dimmed">• {ss}</Text>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </Box>
        </Group>
        }

        {highlight && (
          <Box mt="sm" style={{ textAlign: "center" }}>
            <Text fw={600} c="blue">{highlight}</Text>
          </Box>
        )}

        {status && (
          <Text
            size="sm"
            align="center"
            mt="sm"
            c={{
              assigned: 'blue',
              accepted: 'teal',
              rejected: 'red',
              completed: 'green',
              verified: 'violet'
            }[status] || 'gray'}
          >
            Status: <b>{status.charAt(0).toUpperCase() + status.slice(1)}</b>
          </Text>
        )}
      </Box>
      <Box px="sm" pb="sm">
        <Button
          fullWidth
          mt="xs"
          variant="light"
          onClick={() => setOpenedModalId(studentId)}
        >
          Show Dashboard
        </Button>

        <Button
          fullWidth
          mt="sm"
          color="blue"
          onClick={() => onAssignClick(id)}
          disabled={!showAssignButton}
        >
          Assign Job
        </Button>

        {showVerifyButton && (
          <Button
            fullWidth
            mt="sm"
            color="violet"
            onClick={() => verifyJob(id)}
            disabled={!showVerifyButton}
          >
            Verify Job
          </Button>
        )}
      </Box>

      <Modal
        opened={isModalOpen}
        onClose={() => setOpenedModalId(null)}
        size="lg"
        centered
        scrollArea="inside"
      >
        <StudentDashboard student={studentData} />
      </Modal>
    </Card>
  );
}

export default StudentCard;
