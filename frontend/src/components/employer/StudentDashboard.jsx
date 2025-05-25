import React from 'react';
import { Box, Text, Group, Avatar, Stack, Progress } from '@mantine/core';
import { IconBrandHtml5, IconBrandCss3, IconBrandJavascript, IconBrandPython, IconBrandReact, IconBrandNodejs } from '@tabler/icons-react';

const skillIconMap = {
  'HTML': <IconBrandHtml5 size={20} color="orange" />,
  'CSS': <IconBrandCss3 size={20} color="blue" />,
  'JavaScript': <IconBrandJavascript size={20} color="yellow" />,
  'Python': <IconBrandPython size={20} color="teal" />,
  'React': <IconBrandReact size={20} color="cyan" />,
  'Node.js': <IconBrandNodejs size={20} color="green" />,
};

const bgColors = ['#71AA34', '#2E5A88', '#EAC117', '#F87217'];

const StudentDashboard = ({
  student = {
    id,
    name: 'Unknown',
    university: 'Unknown',
    major: 'Unknown',
    email : 'Unknown',
    image: '',
    passedCourses: [],
    softSkills: [],
    techSkills: [],
  },
}) => {
  return (
    <Box>
      {/* Header */}
      <Group justify="space-between" align="flex-start" mb="md">
        <Box>
          <Text fw={700} size="lg">{student.name}'s Wallet Dashboard</Text>
          <Text>University: {student.schoolName}</Text>
          <Text>Major: {student.majorName}</Text>
          <Text>Email: {student.email}</Text>
        </Box>
        <Avatar size={80} src={student.image} />
      </Group>

      {/* Courses Passed
      <Box mb="md">
        <Text fw={600} mb={4}>Courses Passed</Text>
        <ul style={{ paddingLeft: 16 }}>
          {(student.passedCourses || []).map((course, i) => (
            <li key={i}><Text size="sm">{course}</Text></li>
          ))}
        </ul>
      </Box>
       */}

      {/* Soft Skills 
      <Box mb="md">
        <Text fw={600} mb="xs">Soft Skills</Text>
        <Stack gap="sm">
        {(student.softSkills || []).map((skill, idx) => {
            const percent = Math.round((skill.hours / 200) * 100);
            const color = bgColors[idx % bgColors.length];

            return (
              <Group key={idx} mb="sm" justify="space-between" align="center">
                <Text fw={500} style={{ width: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {skill.skill}
                </Text>
                <Box style={{ width: '100%' }}>
                  <Progress.Root size="xl">
                    <Progress.Section value={percent} color={color}>
                      {skill.hours >= 6 && (
                        <Progress.Label fs="lg">{percent}%</Progress.Label>
                      )}
                    </Progress.Section>
                  </Progress.Root>
                  {skill.hours < 6 && (
                    <Text size="xs">{percent}%</Text>
                  )}
                </Box>
              </Group>
            );
          })}
        </Stack>
      </Box>
      */}

      {/* Technical Skills */}
      <Box mb="md">
        <Text fw={600} mb="xs">Technical Skills</Text>
        <Stack gap="sm">
          {(student.skills || []).map((skillObj, idx) => (
            <Box
              key={idx}
              style={{
                border: '1px solid #ccc',
                borderRadius: 8,
                padding: '12px',
              }}
            >
              <Group spacing="xs" align="center">
                <Text fw={500}>{skillObj.title}</Text>
                {skillObj.level && (
                  <Text size="xs" c="dimmed">({skillObj.level})</Text>
                )}
              </Group>

              {/* Show soft skills under this technical skill */}
              {Array.isArray(skillObj.softSkillTitles) && skillObj.softSkillTitles.length > 0 && (
                <Box ml="md" mt="xs">
                  <Text size="sm" fw={500} c="dimmed">Related Soft Skills:</Text>
                  <ul style={{ paddingLeft: 16 }}>
                    {skillObj.softSkillTitles.map((ss, i) => (
                      <li key={i}>
                        <Text size="sm" c="gray.7">• {ss}</Text>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default StudentDashboard;
