// WalletSkillCard.jsx
import React from 'react';
import {
  Container,
  SimpleGrid,
  Card,
  Badge,
  Group,
  Stack,
  Progress,
  Avatar,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { IconAward, IconChecks } from '@tabler/icons-react';

/** 工具函数：只剩 Level → 33 / 66 / 100 % */
const levelValue = (lvl) =>
  lvl === 'Beginner' ? 33 : lvl === 'Intermediate' ? 66 : 100;

export default function WalletSkillCard({ skills = [] }) {
  const theme = useMantineTheme();

  // 只取 “approved” 状态的技能
  const approved = skills.filter((skill) => skill.verified === 'approved');

  if (!approved.length) {
    return <Text align="center" c="dimmed">No approved skills to display.</Text>;
  }

  return (
    <Container size="lg" py="xl">
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" verticalSpacing="lg">
        {approved.map((skill) => (
          <Card
            key={skill.id}
            radius="lg"
            p="lg"
            shadow="md"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.blue[4]} 0%, ${theme.colors.blue[6]} 100%)`,
              color: theme.white,
              position: 'relative',
            }}
          >
            {/* 左侧绿条 */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 6,
                backgroundColor: theme.colors.green[6],
                borderTopLeftRadius: 'var(--mantine-radius-lg)',
                borderBottomLeftRadius: 'var(--mantine-radius-lg)',
              }}
            />

            {/* 头像 + Approved 徽章 */}
            <Group justify="space-between" align="center" mb="sm">
              <Avatar
                size="lg"
                radius="xl"
                color="blue"
                style={{ border: `2px solid ${theme.white}`, background: theme.colors.gray[0] }}
              >
                <IconAward size={20} />
              </Avatar>

              <Badge
                color="green"
                size="sm"
                radius="sm"
                variant="filled"
                leftSection={<IconChecks size={12} />}
                style={{ textTransform: 'capitalize' }}
              >
                Approved
              </Badge>
            </Group>

            {/* 标题 */}
            <Text fw={700} fz="lg" lh={1.2} mb="xs">
              {skill.title}
            </Text>

            {/* Level 进度条 */}
            <Stack gap={2} mb="xs">
              <Text fz="xs" opacity={0.8}>
                Level: {skill.level}
              </Text>
              <Progress
                value={levelValue(skill.level)}
                size="sm"
                radius="md"
                color="white"
                striped
                animate
                styles={{
                  root: { background: 'rgba(255,255,255,0.20)' },
                  bar: { opacity: 0.9 },
                }}
              />
            </Stack>

            {/* Soft-skills 标签 */}
            {skill.softSkills?.length > 0 && (
              <Group gap={4} wrap="wrap" mt="xs">
                {skill.softSkills.map((tag) => (
                  <Badge
                    key={tag}
                    size="xs"
                    radius="sm"
                    variant="light"
                    color="gray"
                    style={{ color: theme.white }}
                  >
                    {tag}
                  </Badge>
                ))}
              </Group>
            )}
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
