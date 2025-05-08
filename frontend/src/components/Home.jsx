import { IconSchool, IconCertificate, IconBriefcase } from '@tabler/icons-react';
import { Badge, Card, Container, Group, SimpleGrid, Text, Title, useMantineTheme, } from '@mantine/core';
import classes from './Home.module.css';
const featuresData = [
    {
        title: 'Student Wallet',
        description: 'Request endorsements, store verified achievements, and showcase your personal skill profile anywhere.',
        icon: IconSchool,
    },
    {
        title: 'Teacher Verification',
        description: 'Quickly review student submissions, approve soft / hard skills, and issue blockchain‑backed certificates.',
        icon: IconCertificate,
    },
    {
        title: 'Employer Access',
        description: 'Browse trusted skill records, post opportunities, and connect with candidates who meet your criteria.',
        icon: IconBriefcase,
    },
];
export default function Home() {
    const theme = useMantineTheme();
    const features = featuresData.map((feature) => (<Card key={feature.title} shadow="md" radius="md" className={classes.card} padding="xl">
      <feature.icon size={50} stroke={1.5} color={theme.colors.blue[6]}/>
      <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
        {feature.title}
      </Text>
      <Text fz="sm" c="dimmed" mt="sm">
        {feature.description}
      </Text>
    </Card>));
    return (
    <Container size="lg" py="xl" mt="100px">
      <Group justify="center">
        <Badge variant="filled" size="lg">
          All‑in‑one Skill Wallet
        </Badge>
      </Group>

      <Title order={2} className={classes.title} ta="center" mt="sm">
        One platform&nbsp;&bull;&nbsp;Three roles
      </Title>

      <Text c="dimmed" className={classes.description} ta="center" mt="md">
        Students, teachers, and employers collaborate in a single workspace to record, verify, and
        share skills.
      </Text>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt={50}>
        {features}
      </SimpleGrid>
    </Container>);
}
