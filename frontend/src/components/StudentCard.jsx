import { Paper, Flex, Group, Image, Text } from "@mantine/core"
import classes from "./StudentCarousel.module.css"

function StudentCard({ name, school, image }) {
  return (
    <Paper
      p="lg"
      radius="xl"
      shadow="sm"
      withBorder
      className={classes.card}
      style={{ width: "100%", maxWidth: 400 }}
    >
      <Flex direction="column" align="center" gap="lg">
        <Image src={image} alt={name} radius="xl" h={300} />
        <Flex direction="column" w={300}>
          <Group>
            <Text className={classes.title}>Student Name:</Text>
            <Text className={classes.value}>{name}</Text>
          </Group>
          <Group>
            <Text className={classes.title}>School:</Text>
            <Text className={classes.value}>{school}</Text>
          </Group>
        </Flex>
      </Flex>
    </Paper>
  )
}

export default StudentCard
