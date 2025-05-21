import { Box, Title, Paper, Text, Group, Button, Badge, Stack } from "@mantine/core";
import { useTranslation } from "react-i18next";

export default function ActivityList(props) {
  const { t } = useTranslation();
  const displayList = props.courseList.slice(0, 4);

  return (
    <Box w="100%" mb="50px" px="sm">
      <Stack spacing="xs">
        <Group justify="space-between" align="flex-end">
          <Title order={3}>{t("home.myCourses")}</Title>
            <Button variant="light" size="sm" onClick={props.onClickMore}>
              {t("global.more")}
            </Button>
        </Group>

        {displayList.map((course) => (
          <Paper key={course.id} withBorder p="md" radius="md" style={{ width: "100%" }}>
            <Group justify="space-between" align="center">
              <div>
                <Text fw={600}>{course.title}</Text>
                <Text size="xs" c="dimmed">{course.code}</Text>

                <Badge color="blue" variant="light" radius="sm">
                  {course.studentCount} {t("course.students")}
                </Badge>              

                <Group mt="xs">
                  {(course.hardSkills || []).map((skill, index) => (
                    <Badge key={index} color="green" variant="light" radius="sm">
                      {skill}
                    </Badge>
                  ))}
                </Group>
              </div>
            </Group>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
