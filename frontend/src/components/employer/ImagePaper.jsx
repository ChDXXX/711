import { Paper, Flex, Box, Text, Button, Image, Center } from "@mantine/core";
import { IconFilePlus } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import classes from "./Button.module.css";

export default function ImagePaper({
  title,
  description,
  buttonText,
  buttonLink,
  imageUrl,
  showButton = true
}) {
  return (
    <Paper p="lg" radius="md" shadow="sm" withBorder>
      <Flex
        direction={{ base: "column", lg: "row" }}
        gap="xs"
        align="center"
        justify="center"
      >
        {/* Left Side - Text and Button */}
        <Box style={{ flex: 1, padding: 20, width: "100%" }}>
          <h1 style={{marginBottom: "10px", fontFamily: "Times New Roman, serif"}}>
            {title}
          </h1>
          <Text mb="md" fz="xl" style={{ fontFamily: "Times New Roman, serif" }}>{description}</Text>
          {showButton && (
            <Button
              // width="100%"
              component={Link}
              to={buttonLink}
              leftSection={<IconFilePlus size={24} />}
              className={classes.actionButton}
            >
              {buttonText}
            </Button>
          )}
        </Box>
        <Box style={{ flex: 1, padding: 20, maxWidth: 350 }}>
          <Image
            radius="md"
            src={imageUrl}
            alt="illustration"
            className={classes.smallImage}
          />
        </Box>
      </Flex>
    </Paper>
  );
}
