// WalletSkillCard.jsx
import React, { useState } from 'react';
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
  Button,
  useMantineTheme,
  Alert,
  Box,
} from '@mantine/core';
import { IconAward, IconChecks, IconShieldCheck, IconAlertCircle } from '@tabler/icons-react';
import { verifySkillIntegrity } from '../services/hashVerification';

/** 工具函数：只剩 Level → 33 / 66 / 100 % */
const levelValue = (lvl) =>
  lvl === 'Beginner' ? 33 : lvl === 'Intermediate' ? 66 : 100;

export default function WalletSkillCard({ skills = [] }) {
  const theme = useMantineTheme();
  const [verifyingSkills, setVerifyingSkills] = useState(new Set());
  const [verificationResults, setVerificationResults] = useState({});

  // 只取 "approved" 状态的技能
  const approved = skills.filter((skill) => skill.verified === 'approved');

  const handleVerifySkill = async (skill) => {
    const skillId = skill.id;
    if (verifyingSkills.has(skillId)) return; // Already verifying

    setVerifyingSkills(prev => new Set(prev).add(skillId));
    setVerificationResults(prev => ({ ...prev, [skillId]: { loading: true } }));

    try {
      console.log('📋 原始技能数据 (WalletSkillCard):', skill);

      // 构造传递给 verifySkillIntegrity 的数据
      // !!! 重要: 您需要确保这里的字段能从 skill 对象中正确获取 !!!
      // !!! 这些字段必须与 hashVerification.js 中 createSkillHash 和 getSkillHashFromBlockchain 所期望的一致 !!!
      let hardSkillScoresArray = [];
      if (skill.hardSkillScores) {
        if (Array.isArray(skill.hardSkillScores)) {
          hardSkillScoresArray = skill.hardSkillScores.map(score =>
            typeof score === 'object' ? parseInt(score.score || 0) : parseInt(score || 0)
          );
        } else if (typeof skill.hardSkillScores === 'object') {
          hardSkillScoresArray = Object.values(skill.hardSkillScores).map(s =>
            typeof s === 'object' ? parseInt(s.score || 0) : parseInt(s || 0)
          );
        }
      }
      
      let reviewedAtTimestamp = 0;
      let reviewedAtSource = "unknown";

      if (skill.reviewedAt) {
        if (skill.reviewedAt.seconds !== undefined && skill.reviewedAt.nanoseconds !== undefined) { // Firestore Timestamp object
          reviewedAtTimestamp = skill.reviewedAt.seconds;
          reviewedAtSource = "firestore_timestamp_object_seconds";
        } else if (typeof skill.reviewedAt === 'object' && skill.reviewedAt._seconds !== undefined) { // Another Firestore Timestamp variant
          reviewedAtTimestamp = skill.reviewedAt._seconds;
          reviewedAtSource = "firestore_timestamp_alt_object_seconds";
        } else if (typeof skill.reviewedAt === 'string' || typeof skill.reviewedAt === 'number') {
          const ts = parseInt(skill.reviewedAt.toString(), 10); // Ensure it's a number
          if (isNaN(ts)) {
            console.warn(`SKILL ID ${skill.id}: reviewedAt is Not a Number:`, skill.reviewedAt, ". Using 0.");
            reviewedAtTimestamp = 0;
            reviewedAtSource = "parsed_nan_fallback_0";
          } else if (ts > 2000000000000) { // Likely milliseconds (e.g. Date.now() result)
            reviewedAtTimestamp = Math.floor(ts / 1000);
            reviewedAtSource = "parsed_ms_to_seconds";
          } else if (ts > 0) { // Likely seconds already, or a very old ms timestamp we treat as seconds
            reviewedAtTimestamp = ts;
            reviewedAtSource = "parsed_seconds_or_old_ms";
          } else {
            reviewedAtTimestamp = 0; // Default for 0 or negative
            reviewedAtSource = "parsed_zero_or_negative";
          }
        } else {
            console.warn(`SKILL ID ${skill.id}: Unrecognized reviewedAt format:`, skill.reviewedAt, ". Using 0.");
            reviewedAtTimestamp = 0;
            reviewedAtSource = "unrecognized_format_fallback_0";
        }
      } else {
        console.warn(`SKILL ID ${skill.id}: reviewedAt is missing or falsy:`, skill.reviewedAt, ". Using 0.");
        reviewedAtTimestamp = 0; 
        reviewedAtSource = "missing_fallback_0";
      }
      console.log(`SKILL ID ${skill.id}: Parsed reviewedAt: ${reviewedAtTimestamp} (seconds) from source: ${reviewedAtSource}, original:`, skill.reviewedAt);

      const skillDataForVerification = {
        customUid: skill.student?.id || skill.ownerId || skill.userId || "", // Ensure you have a consistent student ID field
        courseCode: skill.courseCode || "",
        courseTitle: skill.courseTitle || skill.title || "",
        hardSkillNames: skill.hardSkillNames || skill.hardSkills || [], // hardSkills might be an array of names
        hardSkillScores: hardSkillScoresArray,
        level: skill.level || "",
        ownerId: skill.student?.id || skill.ownerId || skill.userId || "", // Duplicate for safety, ensure consistency
        reviewedAt: reviewedAtTimestamp, // This is CRITICAL for matching blockchain record
        reviewedBy: skill.reviewedBy || "",
        schoolId: skill.schoolId || "",
        cid: skill.attachmentCid || skill.cid || ""
      };
      
      console.log('📦 Constructed validation data (WalletSkillCard):', skillDataForVerification);

      const result = await verifySkillIntegrity(skillDataForVerification, skillId);
      setVerificationResults(prev => ({ ...prev, [skillId]: { ...result, loading: false } }));

      // Display alert message
      if (result.isValid) {
        alert(`✅ Validation successful!\n\nDatabase hash: ${result.databaseHash?.substring(0, 16)}...\nBlockChain hash: ${result.blockchainHash?.substring(0, 16)}...\n\n${result.message}`);
      } else {
        alert(`❌ Validation Unsuccessful!\n\n${result.message}\n\nDatabase hash: ${result.databaseHash?.substring(0, 16)}...\nBlockChain hash: ${result.blockchainHash?.substring(0, 16)}...\nerror : ${result.error || 'Hash mismatch or record not found'}`);
      }

    } catch (error) {
      console.error('Validation process error (WalletSkillCard):', error);
      setVerificationResults(prev => ({
        ...prev,
        [skillId]: { isValid: false, error: error.message, message: 'Validation process error', loading: false }
      }));
      alert(`❌ Validation process error: ${error.message}`);
    } finally {
      setVerifyingSkills(prev => {
        const newSet = new Set(prev);
        newSet.delete(skillId);
        return newSet;
      });
    }
  };

  if (!approved.length) {
    return <Text align="center" c="dimmed">No approved skills to display.</Text>;
  }

  return (
    <Container size="lg" py="xl">
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" verticalSpacing="lg">
        {approved.map((skill) => {
          const currentResult = verificationResults[skill.id];
          return (
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
              {/* Left green bar */}
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

              <Stack> {/* Use Stack for main content flow */}
                <Group justify="space-between" align="center">
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

                <Text fw={700} fz="lg" lh={1.2} mb="xs">
                  {skill.title}
                </Text>

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

                {/* Verification Button and Status */}
                <Box mt="md">
                  <Button
                    fullWidth
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'cyan' }}
                    leftSection={<IconShieldCheck size={16} />}
                    onClick={() => handleVerifySkill(skill)}
                    loading={verifyingSkills.has(skill.id) || currentResult?.loading}
                    disabled={verifyingSkills.has(skill.id) || currentResult?.loading}
                    radius="md"
                    size="sm"
                    style={{ fontWeight: 600 }}
                  >
                    {currentResult?.loading ? "Validation now..." : 
                     currentResult ? (currentResult.isValid ? "Validation successful" : "Validation Unuccessful") 
                     : "Verify skills data"}
                  </Button>
                  {currentResult && !currentResult.loading && (
                    <Box 
                      mt="xs" 
                      p="xs" 
                      style={{
                        borderRadius: '8px',
                        backgroundColor: currentResult.isValid ? 'rgba(0, 180, 110, 0.15)' : 'rgba(220, 53, 69, 0.15)',
                        border: `1px solid ${currentResult.isValid ? 'rgba(0, 180, 110, 0.3)' : 'rgba(220, 53, 69, 0.3)'}`
                      }}
                    >
                      <Group spacing={8} mb={6}>
                        {currentResult.isValid ? 
                          <IconChecks size={16} color="#00b46e" /> : 
                          <IconAlertCircle size={16} color="#dc3545" />
                        }
                        <Text fw={600} size="sm" color={currentResult.isValid ? "#00b46e" : "#dc3545"}>
                          {currentResult.isValid ? "Verification Success" : "Verification Failed"}
                        </Text>
                      </Group>
                      
                      <Text size="xs" mb={currentResult.error || currentResult.databaseHash || currentResult.blockchainHash ? 8 : 0}>
                        {currentResult.message}
                      </Text>
                      
                      {!currentResult.isValid && currentResult.error && (
                        <Text size="xs" c="dimmed" mb={4}>
                          error message: {typeof currentResult.error === 'object' ? JSON.stringify(currentResult.error) : currentResult.error}
                        </Text>
                      )}
                      
                      {currentResult.databaseHash && (
                        <Group spacing={4}>
                          <Text size="xs" c="dimmed" fw={500}>Database hash:</Text>
                          <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                            {currentResult.databaseHash.substring(0,12)}...
                          </Text>
                        </Group>
                      )}
                      
                      {currentResult.blockchainHash && (
                        <Group spacing={4}>
                          <Text size="xs" c="dimmed" fw={500}>BlockChain hash:</Text>
                          <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                            {currentResult.blockchainHash.substring(0,12)}...
                          </Text>
                        </Group>
                      )}
                    </Box>
                  )}
                </Box>
              </Stack>
            </Card>
          )
        })}
      </SimpleGrid>
    </Container>
  );
}
