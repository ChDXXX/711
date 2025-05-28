import { Avatar, Box, Group, Text } from "@mantine/core"
import classes from "./UserButton.module.css"

export function UserButton({ collapsed, name, role, image }) {
  return (
    <Box className={classes.user}>
      <Group>
        <Avatar src={image} radius="xl" />
        {!collapsed && (
          <div style={{ flex: 1 }}>
            <Text size="sm" fw={500}>
              {name}
            </Text>
            <Text c="dimmed" size="xs">
              {role}
            </Text>
          </div>
        )}
      </Group>
    </Box>
  )
}
