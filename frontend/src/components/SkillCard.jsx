import { Box, Card, Group, Text } from "@mantine/core";
<<<<<<< HEAD
import classes from "../pages/DigitalSkillWallet.module.css";
=======
import classes from "../pages/HomePage.module.css";
>>>>>>> 0fdfa69a7 (UserButton.jsx, UserButton.css, Cardscroll.jsx, AlertBox.jsx, Barchart.jsx,)

const SkillCard = ({ title, children }) => (
    <Card shadow="sm" radius="md" withBorder bg="var(--mantine-color-white)">
      <Group className={classes.heading} align="center">
        <Text size="md" fw={700}>{title}</Text>
      </Group>
      <Box>{children}</Box>
    </Card>
  );

  
export default SkillCard;