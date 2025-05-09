import { Box, Card, Group, Text } from "@mantine/core";
import classes from "../pages/DigitalSkillWallet.module.css";

const SkillCard = ({ title, children }) => (
    <Card shadow="sm" radius="md" withBorder bg="var(--mantine-color-white)">
      <Group className={classes.heading} align="center">
        <Text size="md" fw={700}>{title}</Text>
      </Group>
      <Box>{children}</Box>
    </Card>
  );

  
export default SkillCard;