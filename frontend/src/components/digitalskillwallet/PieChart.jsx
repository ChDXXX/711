import { Box, Text, Stack } from "@mantine/core";
import ReactECharts from "echarts-for-react";

export default function PieChart({ skill }) {
  const score = skill.score || 0;
  const percentage = Math.round((score / 5) * 100);

  const option = {
    title: {
      text: `${score.toFixed(1)}/5`,
      left: "center",
      top: "40%",
      textStyle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333"
      }
    },
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)"
    },
    series: [
      {
        name: skill.title,
        type: "pie",
        radius: ["50%", "75%"],
        avoidLabelOverlap: false,
        label: { show: false },
        data: [
          {
            value: score,
            name: skill.title,
            itemStyle: { color: skill.color || "#4dabf7" }
          },
          {
            value: 5 - score,
            name: "Remaining",
            itemStyle: { color: "#eee" }
          }
        ]
      }
    ]
  };

  return (
    <Box style={{ width: 220, height: 280 }}>
      <ReactECharts option={option} style={{ height: 200 }} />
      <Stack spacing={2} align="center" mt="xs">
        <Text size="sm" fw={500}>{skill.title}</Text>
        <Text size="xs" c="dimmed">
          Course: {skill.courseCode || "N/A"} · Level: {skill.level || "N/A"}
        </Text>
      </Stack>
    </Box>
  );
}
