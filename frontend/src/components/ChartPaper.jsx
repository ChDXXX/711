import ReactECharts from "echarts-for-react";
import { Box, Flex, Grid, Paper, Text } from "@mantine/core";
import classes from "../pages/EmployerPage.module.css";

export default function ApplicationStatsChart({ data }) {
 
  return (
    <Paper p="lg" radius="md" shadow="sm" withBorder>
              <Flex
                direction={{ base: "column", lg: "row" }}
                gap="lg"
                align="center"
                justify="center"
              >
                {/* Left Side - Pie Chart */}
                <Grid.Col
                  span={{ base: 12, lg: 6 }}
                  order={{ base: 2, lg: 1 }}
                  style={{ width: "100%" }}
                >
                  <Box
                    style={{ flex: 1, padding: 20, width: "100%", order: 2 }}
                  >
                    <ReactECharts
                      option={{
                        tooltip: {
                          trigger: "item",
                          formatter: "{b}: {c} ({d}%)"
                        },
                        legend: {
                          orient: "vertical",
                          left: "left",
                          top: "center"
                        },
                        series: [
                          {
                            name: "Applications",
                            type: "pie",
                            radius: ["45%", "90%"],
                            center: ["70%", "53%"],
                            avoidLabelOverlap: false,
                            itemStyle: {
                              borderRadius: 10,
                              borderColor: "#fff",
                              borderWidth: 2
                            },
                            label: {
                              show: true,
                              position: "outside",
                              formatter: "{d}%",
                              fontSize: 15,
                              fontWeight: "400",
                              color: "black"
                            },
                            data: data.map(item => ({
                              value: item.count,
                              name: item.status,
                              itemStyle: { color: item.color }
                            }))
                          }
                        ]
                      }}
                      className={classes.chartContainer}
                    />
                  </Box>
                </Grid.Col>

                {/* Right Side - Text */}
                <Grid.Col
                  span={{ base: 12, lg: 6 }}
                  order={{ base: 1, lg: 2 }}
                  style={{ width: "100%" }}
                >
                  <Box style={{ flex: 1, padding: 20, width: "100%" }}>
                    <h1
                      style={{
                        marginBottom: "10px",
                        fontFamily: "Times New Roman, serif"
                      }}
                    >
                      Message Summary
                    </h1>
                    <Text
                      mb="md"
                      fz="xl"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      Get a quick visual breakdown of your Messages' status to
                      manage your inbox better. This summary helps you stay
                      organized and make faster decisions — all at a glance.
                    </Text>
                  </Box>
                </Grid.Col>
              </Flex>
            </Paper>
  );
}
