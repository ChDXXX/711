import {
  Box,
  Card,
  Group,
  SimpleGrid,
  Text,
  Title,
  Stack,
  ThemeIcon,
  Badge,
  Anchor,
} from "@mantine/core";
import {
  IconClock,
  IconBrandReact,
  IconFileText,
} from "@tabler/icons-react";

export default function StatusOverview({ skills }) {
  return (
    <Box my="xl">
      <Title order={3} mb="md">Skill Overview</Title>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        {skills.map((skill, index) => (
          <Card
            key={index}
            padding="md"
            radius="md"
            withBorder
            style={{ backgroundColor: "#f9fafb", minHeight: 140 }}
          >
            <Stack spacing={4}>
              <Group gap={8} align="center">
                <ThemeIcon variant="light" color="cyan" size="sm" radius="xl">
                  <IconBrandReact size={16} />
                </ThemeIcon>
                <Text fw={600} size="sm">{skill.title}</Text>
              </Group>

              <Text size="xs" c="dimmed">Level: {skill.level}</Text>
              <Text size="xs" c="dimmed" lineClamp={2}>{skill.description}</Text>

              <Group justify="space-between" mt="xs">
                <Badge leftSection={<IconClock size={12} />} color="gray" variant="light">
                  In Progress
                </Badge>

                {skill.attachmentCid && (
                  <Anchor
                    size="xs"
                    href={`https://ipfs.io/ipfs/${skill.attachmentCid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconFileText size={14} />
                  </Anchor>
                )}
              </Group>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
}
