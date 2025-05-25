import {
  Paper,
  Flex,
  Group,
  Text,
  Box,
  Button,
  Stack,
  Title,
} from '@mantine/core';

export default function JobTable({ title, data, onVerify, onEdit, onDelete, onRefresh  }) {
  return (
    <Box w="100%" mb="50px">
      <Stack spacing="xs">
        <Group>
          <Button variant="light" ml="auto" mt="15px" onClick={onRefresh}>Refresh</Button>
        </Group>

        {data.map((job) => (
          <Paper key={job.id} withBorder p="sm" radius="md">
            <Flex
              justify="space-between"
              align="flex-start"
              direction={{ base: 'column', sm: 'row' }}
              gap="sm"
            >
              {/* Left: Job details */}
              <Box style={{ flex: 1 }}>
                <Text fw={600} size="sm">{job.title}</Text>
                <Text size="xs" c="dimmed">Location: {job.location}</Text>
                <Text size="xs" c="dimmed">
                  Assigned to <Text span fw={800}>{job.assignments?.length || 0}</Text> student{(job.assignments?.length || 0) !== 1 && 's'}
                </Text>

                {job.skills?.length > 0 && (
                  <Group spacing={4} mt={4}>
                    {job.skills.map((skill, idx) => (
                      <Box
                        key={idx}
                        px="xs"
                        py={2}
                        bg="gray.1"
                        style={{ borderRadius: 4, fontSize: 12 }}
                      >
                        {skill}
                      </Box>
                    ))}
                  </Group>
                )}
                {job.softSkills?.length > 0 && (
                  <Group spacing={4} mt={2}>
                    {job.softSkills.map((softSkill, idx) => (
                      <Box
                        key={`soft-${idx}`}
                        px="xs"
                        py={2}
                        bg="yellow.1"
                        style={{ borderRadius: 4, fontSize: 12 }}
                      >
                        {softSkill}
                      </Box>
                    ))}
                  </Group>
                )}
              </Box>

              {/* Right: Assigned user + buttons */}
              <Box style={{ textAlign: 'right', minWidth: '200px' }}>
                <Flex justify="flex-end" gap="sm" wrap="wrap">
                  {job.status === 'completed' && !job.verified && (
                    <Button size="xs" color="green" onClick={() => onVerify(job.id)}>
                      Verify
                    </Button>
                  )}
                  <Button size="xs" variant="light" onClick={() => onEdit(job.id)}>
                    Edit
                  </Button>
                {(!job.assignments || job.assignments.length === 0) && (
                  <Button size="xs" color="red" variant="outline" onClick={() => onDelete(job.id)}>
                    Delete
                  </Button>
                )}                  
                </Flex>
              </Box>
            </Flex>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}