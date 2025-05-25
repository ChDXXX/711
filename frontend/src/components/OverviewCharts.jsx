import React from 'react';
import {
  Box,
  Card,
  Group,
  Title,
  Grid,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { IconChartPie, IconChartBar } from '@tabler/icons-react';
import { useTranslation } from "react-i18next";
import ReactECharts from 'echarts-for-react';
import PropTypes from 'prop-types';

export default function OverviewCharts({ skills = [], softSkillMap = {} }) {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const spacing = theme.spacing;

  // 只使用 verified === 'approved' 的技能
  const approvedSkills = skills.filter((s) => s.verified === 'approved');

  // 如果没有已通过的技能，显示提示
  if (!approvedSkills.length) {
    return (
      <Box sx={{ mt: spacing.xl }}>
        <Text align="center" c="dimmed">
          No approved skills to display.
        </Text>
      </Box>
    );
  }

  // 1. 技能级别分布（仅限已通过）
  const levelDist = () => {
    const counts = { Beginner: 0, Intermediate: 0, Advanced: 0 };
    approvedSkills.forEach((s) => {
      counts[s.level] = (counts[s.level] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  // 2. 软技能频次（仅限已通过）
  const softCounts = () => {
    const counter = {};
    approvedSkills.forEach((s) => {
      (s.softSkills || []).forEach((tag) => {
        counter[tag] = (counter[tag] || 0) + 1;
      });
    });
    return Object.entries(counter).map(([name, value]) => ({
      name: softSkillMap[name] || name,
      value,
    }));
  };

  // 饼图配置
  const pieOption = {
    color: [theme.colors.blue[5], theme.colors.green[5], theme.colors.orange[5]],
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      data: levelDist().map((d) => d.name),
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        data: levelDist(),
        label: { show: true, formatter: '{b}: {d}%' },
        labelLine: { length: 8, length2: 4 },
      },
    ],
  };

  // 柱状图配置
  const barOption = {
    color: theme.colors.blue[5],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'category',
      data: softCounts().map((d) => d.name),
      axisLabel: { rotate: 30, interval: 0 },
    },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'bar',
        data: softCounts().map((d) => d.value),
        barWidth: '50%',
      },
    ],
  };

  return (
    <Box sx={{ mt: spacing.xl }}>
      <Grid>
        {/* 技能级别分布 */}
        <Grid.Col xs={12} md={6}>
          <Card p="md" sx={{ height: '100%' }}>
            <Group sx={{ mb: spacing.sm, alignItems: 'center' }}>
              <IconChartPie size={20} style={{ marginRight: spacing.xs }} />
              <Title order={4}>{t("wallet.peiChart")}</Title>
            </Group>
            <ReactECharts option={pieOption} style={{ height: 300, width: '100%' }} />
          </Card>
        </Grid.Col>

        {/* 软技能频次 */}
        <Grid.Col xs={12} md={6}>
          <Card p="md" sx={{ height: '100%' }}>
            <Group sx={{ mb: spacing.sm, alignItems: 'center' }}>
              <IconChartBar size={20} style={{ marginRight: spacing.xs }} />
              <Title order={4}>{t("wallet.barChart")}</Title>
            </Group>
            <ReactECharts option={barOption} style={{ height: 300, width: '100%' }} />
          </Card>
        </Grid.Col>
      </Grid>
    </Box>
  );
}

OverviewCharts.propTypes = {
  skills: PropTypes.array.isRequired,
  softSkillMap: PropTypes.object.isRequired,
};
