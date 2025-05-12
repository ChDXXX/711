// components/TechnicalSkillsChart.jsx
import ReactECharts from "echarts-for-react";
import { Flex } from "@mantine/core";
import PropTypes from "prop-types";

const BarChart = ({ data }) => {
  const chartOptions = {
    tooltip: {
      trigger: "axis",
      formatter: "{b}: {c} hours",
    },
    xAxis: [
      {
        type: "value",
        min: 0,
        max: 200,
        interval: 50,
        position: "top",
        axisLine: { lineStyle: { color: "black", width: 2 } },
        axisLabel: {
          fontSize: 12,
          color: "black",
          formatter: (value) => {
            if (value === 50) return "Novice";
            if (value === 100) return "Proficient";
            if (value === 150) return "Advanced";
            if (value === 200) return "Expert";
            return "";
          },
        },
      },
      {
        type: "value",
        min: 0,
        max: 200,
        interval: 50,
        position: "bottom",
        splitLine: {
          lineStyle: {
            color: "black",
            width: 1,
          },
        },
        axisLabel: {
          fontSize: 14,
          color: "black",
        },
      },
    ],
    yAxis: {
      type: "category",
      data: data.map((skill) => skill.tech_skill),
      axisLabel: {
        fontSize: window.innerWidth < 768 ? 13 : 14,
        rotate: 30,
      },
      axisLine: {
        lineStyle: {
          color: "black",
        },
      },
    },
    series: [
      {
        data: data.map((skill) => skill.hours),
        type: "bar",
        itemStyle: {
          color: (params) => data[params.dataIndex].color,
        },
        barWidth: "60%",
      },
    ],
  };

  return (
    <Flex justify="center">
      <ReactECharts
        option={chartOptions}
        className="chart-container"
        style={{ height: "300px", width: "100%" }}
      />
    </Flex>
  );
};

BarChart.propTypes = {
  data: PropTypes.array.isRequired,
};

export default BarChart;
