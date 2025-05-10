import { Box, Flex } from "@mantine/core";
import ReactECharts from "echarts-for-react";

export default function PieChart({ skill, key }) {
  const option = {
    title: {
      text: skill.soft_skill,
      left: "center",
      top: "5%",
      textStyle: { fontSize: 14 }
    },
    tooltip: { formatter: "{b}: {d}%" },
    series: [
      {
        name: skill.soft_skill,
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderWidth: 2
        },
        label: {
          show: true,
          position: "inside",
          formatter: "{d}%",
          fontSize: 14,
          fontWeight: "bold",
          color: "black"
        },
        data: [
          {
            value: skill.percentage,
            name: skill.soft_skill,
            itemStyle: { color: skill.color }
          },
          {
            value: 100 - skill.percentage,
            name: "Remaining",
            itemStyle: { color: "#eee" }
          }
        ]
      }
    ]
  };

  return (

      <Box key={key} style={{ width: "250px", height: "250px" }}>
        <ReactECharts option={option} />
      </Box>

  );
}
