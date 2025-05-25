import {
  Avatar,
  Group,
  Box,
  Title,
  Flex,
  Text,
  Stack,
  Paper,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../style/global.css';

export default function UserTable({
  title,
  studentList = [],
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Box w="100%" mb="50px" px="sm" mt="6px">
      <Title order={3}>{t(title)}</Title>

      <Stack
      mt="16px"
        spacing="xs"
        style={{
          maxHeight: 480,         
          overflowY: 'auto',
        }}
      >
        {studentList.map((item, idx) => (
          <Paper
            key={`${item.email || item.name}-${idx}`}
            withBorder
            p="sm"
            radius="md"
            className="click-row"
            onClick={() => navigate(`/digital-skill-wallet/${item.customUid}`)}
          >
            <Flex
              justify="space-between"
              align="center"
              direction={{ base: 'column', sm: 'row' }}
              gap="sm"
            >
              <Group gap="sm">
                <Avatar name={item.name} color="initials" radius="xl">
                  {item.name.slice(0, 2).toUpperCase()}
                </Avatar>
                <div>
                  <Text fw={600} size="sm">
                    {item.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {item.email}
                  </Text>
                </div>
              </Group>

              <Flex gap="sm" align="center" wrap="wrap">
                <Text size="sm" fw={500}>
                  {item.course}
                </Text>
                <Text size="xs" c="dimmed">
                  {t('user.lastActive')}: {item.lastActive}
                </Text>
              </Flex>
            </Flex>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
