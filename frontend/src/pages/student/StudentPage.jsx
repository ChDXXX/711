import React from "react";
import { Container, Group, Box, Loader, Center } from "@mantine/core";
import {
  IconHome2,
  IconWallet,
  IconClipboardList,
  IconUser,
  IconSettings,
  IconBriefcase,
} from "@tabler/icons-react";
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useFireStoreUser } from "../../hooks/useFirestoreUser";
import HomeNavbar from "../../components/HomeNavbar";

const StudentPage = () => {
  const { user, role } = useAuth();
  const { userData, isLoading } = useFireStoreUser(user);

  // 权限检查：必须登录且角色为 student
  if (!user || role !== "student") return <Navigate to="/" />;

  // 侧边栏导航数据
const navbarData = [
  { link: "", labelKey: "navbar.home", icon: IconHome2 },
  { link: "request-skill", labelKey: "navbar.requestSkill", icon: IconClipboardList },
  { link: "assigned-jobs", labelKey: "Job Board", icon: IconBriefcase },
  { link: "settings", labelKey: "navbar.settings", icon: IconSettings },
];
  return (
    <Container maw="1500px">
      <Group align="flex-start">
        {/* 左侧导航栏 */}
        <Box>
          {isLoading ? (
            <Center>
              <Loader size="sm" />
            </Center>
          ) : (
            <HomeNavbar userData={userData} navbarData={navbarData} />
          )}
        </Box>

        {/* 右侧内容区：动态切换子页面 */}
        <Box style={{ flex: 1 }}>
          <Outlet />
        </Box>
      </Group>
    </Container>
  );
};

export default StudentPage;
