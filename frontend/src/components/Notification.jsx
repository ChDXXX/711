import { Box, Card, Text, Group, ThemeIcon, Anchor } from "@mantine/core";
import { IconBell } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Notification({ count = 0, label = "items", messagePrefix, messageSuffix, userType }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box mt="10px">
      <Card shadow="xs" padding="md" radius="md" withBorder bg="blue.0" mb="md">
        <Group align="center">
          <ThemeIcon variant="subtle" color="blue" radius="xl" size="lg">
            <IconBell size={20} />
          </ThemeIcon>
    <Group>
      <Text fw={600} c="blue">
        {t(messagePrefix)}{' '}
        <Text span fw={700} c="blue.9">
          {count} {t(label)}
        </Text>{' '}
        {t(messageSuffix)}
      </Text>

      {userType === 'student' &&       
      <Anchor
        fw={600}
        c="blue"
        onClick={(e) => {
          e.preventDefault();
          navigate('/student/request-skill');
        }}
      >
        {t("notification.studentCheck")}
      </Anchor>}

      {userType === 'school' &&       
      <Anchor
        fw={600}
        c="blue"
        onClick={(e) => {
          e.preventDefault();
          navigate('/school/verify-skill');
        }}
      >
        {t("notification.schoolCheck")}
      </Anchor>}
    </Group>

        </Group>
      </Card>
    </Box>
  );
}
