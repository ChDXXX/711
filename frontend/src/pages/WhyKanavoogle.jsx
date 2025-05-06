import { Container, Divider, List, Space, Text, ThemeIcon, Title } from '@mantine/core';
import { IconBook, IconBuildingBank, IconCertificate, IconUsers } from '@tabler/icons-react';

/**
 * “Why Kanavoogle” – long‑form narrative, grounded in the project plan.
 * Explains the rationale, objectives and benefits of anchoring skill evidence on‑chain.
 */
export default function WhyKanavoogle() {
  return (
    <Container size="md" py="xl">
      {/* 1  Headline */}
      <Title order={1} ta="center">
        Why <span style={{ color: 'var(--mantine-color-blue-6)' }}>Kanavoogle</span>?
      </Title>
      <Text ta="center" c="dimmed" mt="sm">
        A Digital Skill Wallet that makes credentials <b>permanent</b>, <b>verifiable</b> and <b>portable</b> —
        exactly what our plan sets out to build.
      </Text>

      {/* 2  Background / Problem */}
      <Space h="xl" />
      <Divider label="The problem we tackle" labelPosition="center" />
      <Space h="md" />

      <Text>
      Certificates too often end up buried in email attachments or one‑off LMS downloads; links rot, institutions rebrand, and graduates lose access as soon as they leave campus. Without a reliable, shareable record of learning, students struggle to turn their skills into opportunities, teachers find it hard to prove the impact of their courses, and employers waste time manually verifying credentials they’re not sure they can trust.
      </Text>

      {/* 3  Solution Overview */}
      <Space h="xl" />
      <Divider label="Our on‑chain solution" labelPosition="center" />
      <Space h="md" />

      <List spacing="lg" size="md">
        <List.Item icon={<ThemeIcon radius="xl" size={28} color="blue"><IconCertificate size={16} /></ThemeIcon>}>
          <Text fw={600}>Immutable credentials</Text>
          <Text c="dimmed" fz="sm">
            Every endorsement is hashed and anchored on a public blockchain.  If the file ever
            changes, the hash doesn’t match — making tampering impossible.
          </Text>
        </List.Item>

        <List.Item icon={<ThemeIcon radius="xl" size={28} color="blue"><IconBook size={16} /></ThemeIcon>}>
          <Text fw={600}>Portable skill wallet</Text>
          <Text c="dimmed" fz="sm">
            Learners own a single wallet address.  They carry verified skills from school ➜ job ➜
            lifelong learning — no platform lock‑in, no subscription fees.
          </Text>
        </List.Item>

        <List.Item icon={<ThemeIcon radius="xl" size={28} color="blue"><IconUsers size={16} /></ThemeIcon>}>
          <Text fw={600}>Multi‑stakeholder workflow</Text>
          <Text c="dimmed" fz="sm">
            Students request, teachers approve, employers verify — all through role‑based dashboards
            defined in the project scope.
          </Text>
        </List.Item>

        <List.Item icon={<ThemeIcon radius="xl" size={28} color="blue"><IconBuildingBank size={16} /></ThemeIcon>}>
          <Text fw={600}>Open‑standard integration</Text>
          <Text c="dimmed" fz="sm">
            Smart-contract ABIs and REST APIs follow W3C Verifiable Credential patterns, allowing other
            universities or HR systems to plug in with minimal effort.
          </Text>
        </List.Item>
      </List>

      {/* 4  Expected Benefits (aligned with plan objectives) */}
      <Space h="xl" />
      <Divider label="Benefits mapped to our project objectives" labelPosition="center" />
      <Space h="md" />

      <List spacing="lg" size="md" icon={null}>
        <List.Item>
          <b>For students —</b> proof of competence that <i>never expires</i>, boosting employability and
          scholarship prospects.
        </List.Item>
        <List.Item>
          <b>For educators —</b> streamlined endorsement workflow and analytics demonstrating course
          impact.
        </List.Item>
        <List.Item>
          <b>For employers —</b> instant cryptographic verification reduces hiring fraud and vetting
          costs.
        </List.Item>
      </List>
    </Container>
  );
}
