import { Avatar, Box, Group, Text } from "@mantine/core"
import classes from "./Button.module.css"

export function UserButton({ collapsed, name, role, image }) {
  return (
    <Box className={classes.user}>
      <Group>
      <Avatar
        src={image || null}
        color="white"
        radius="xl"
        bg={"dark"}
      >
        {(!image && name) ? name.slice(0, 2).toUpperCase() : null}
      </Avatar>
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
