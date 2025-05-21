import { useState, useEffect } from 'react';
import {
  Group,
  Drawer,
  Avatar,
  Text,
  UnstyledButton,
} from '@mantine/core';
import {
  IconBaselineDensityMedium,
  IconCertificate,
  IconArrowRight,
} from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import classes from '../style/HomeNavbar.module.css';
import ActionButton from './common/ActionButton';

export default function HomeNavbar(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const basePath = location.pathname.split("/")[1] || "";
  const [active, setActive] = useState(props.navbarData[0]?.labelKey);
  const [opened, setOpened] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const currentPath = location.pathname.split("/")[2];
    const matchedItem = props.navbarData.find((item) => item.link === currentPath);
    if (matchedItem) {
      setActive(matchedItem.labelKey);
    }
  }, [location.pathname, props.navbarData]);

  const links = props.navbarData.map((item) => {
    const resolvedPath = `/${basePath}/${item.link}`.replace(/\/+$/, "");

    return (
      <a
        className={classes.link}
        data-active={active === item.labelKey || undefined}
        href={resolvedPath}
        key={item.labelKey}
        onClick={(event) => {
          event.preventDefault();
          navigate(resolvedPath);
          setActive(item.labelKey);
        }}
      >
        <item.icon className={classes.linkIcon} stroke={1.5} />
        <span>{t(item.labelKey)}</span>
      </a>
    );
  });

  const userSection = (
    <UnstyledButton className={classes.user}>
      <Group>
        <Avatar color="indigo" radius="xl">
          {props.userData?.name?.slice(0, 2).toUpperCase()}
        </Avatar>
        <div style={{ flex: 1 }}>
          <Text size="18px" fw={500}>
            {props.userData?.name}
          </Text>
          <Text c="dimmed" size="14px">
            {props.userData?.email}
          </Text>
        </div>
      </Group>
    </UnstyledButton>
  );

  return (
    <>
      {isMobile ? (
        <>
          <div className={classes.actionNavbar}>
            <ActionButton
              icon={<IconBaselineDensityMedium size={20} stroke={1.5} />}
              onActionButton={() => setOpened(true)}
            />
          </div>

          <Drawer
            withOverlay
            position="left"
            opened={opened}
            size="300px"
            onClose={() => setOpened(false)}
            withCloseButton={false}
          >
            <nav className={classes.navbar}>
              {userSection}
              <div className={classes.navbarMain}>{links}</div>
            </nav>
          </Drawer>
        </>
      ) : (
        <nav className={classes.navbar}>
          {userSection}
          <div className={classes.navbarMain}>
            {props.userData?.role === "student" && (
              <a
                className={classes.link}
                href={'profile'}
                onClick={(event) => {
                  event.preventDefault();
                  navigate(`/digital-skill-wallet/${props.userData?.customUid}`);
                }}
              >
                <Group justify="space-between" align="center" w="100%">
                  <Group gap="xs" align="center">
                    <IconCertificate stroke={1.5} />
                    <span>Digital Skill Wallet</span>
                  </Group>
                  <IconArrowRight stroke={1.5} />
                </Group>
              </a>
            )}
            {links}
          </div>
        </nav>
      )}
    </>
  );
}
