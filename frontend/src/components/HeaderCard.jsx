import { Paper, Flex } from "@mantine/core";
import { UserButton } from "./UserButton";
import classes from "../pages/EmployerPage.module.css";

export default function HeaderCard({ userData, userType = "User" }) {
    const idLabel = {
        employer: "Employer ID",
        student: "Student ID",
        teacher: "Teacher ID"
      };
  
    return (
    <Paper shadow="xs" radius="md" p="sm" withBorder className={classes.headerPaper}>
      <Flex justify="space-between" align="center" direction="row">
        <div>
          <h2 className={classes.headerTitle}>{userType.toUpperCase()} Overview</h2>
          <p className={classes.headerSubtitle}>
            {idLabel[userType.toLowerCase()] || "ID"}: {userData.id} | Name: {userData.name}{" "}
            {userData.company && `| Company: ${userData.company}`} | Role: {userData.role}
          </p>
        </div>
        <div className={classes.userButtonWrapper}>
          <UserButton
            collapsed={true}
            name={userData.name}
            role={userData.role}
            image={userData.image}
          />
        </div>
      </Flex>
    </Paper>
  );
}
