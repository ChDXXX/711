import { useState } from 'react';
import { Group, Drawer, Avatar, Text, UnstyledButton } from '@mantine/core';
import { IconBaselineDensityMedium, IconCertificate, IconArrowRight } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks'; 
import { useNavigate } from "react-router-dom";

import classes from './HomeNavbar.module.css';

import ActionButton from './common/ActionButton';

export default function HomeNavbar(props) {
  const navigate = useNavigate();
  
  // navbar的列表渲染
  const [active, setActive] = useState(props.navbarData[0].label);
  const links = props.navbarData.map((item) => (
  <a 
    className={classes.link} 
    data-active={active === item.label || undefined} 
    href={item.link} 
    key={item.label} 
    onClick={(event) => {
      event.preventDefault();
      navigate(item.link);
      setActive(item.label);
    }}>
    <item.icon className={classes.linkIcon} stroke={1.5}/>
    <span>{item.label}</span>
  </a>));

  // 根据移动端/PC端显示不同的navbar  
  // 1.移动端时显示actiion button 通过点击它显示navbar
  // 2.PC端直接显示navbar
  const [opened, setOpened] = useState(false) 
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleActionButton =()=>{
    setOpened(true)
  }

  return(
    <>
    {isMobile? (
      <>
        <div className={classes.actionNavbar}>
          <ActionButton
          icon={<IconBaselineDensityMedium size={20} stroke={1.5}/>} 
          onActionButton={handleActionButton}/>
        </div>
        
        <Drawer withOverlay position="left" opened={opened} size="300px" onClose={() => setOpened(false)} withCloseButton={false}>
            <nav className={classes.navbar}>

              <UnstyledButton className={classes.user}>
                <Group>
                <Avatar name={props.userData?.name} color="initials" radius="xl">
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

              <div className={classes.navbarMain}>
                {links}
              </div>
            </nav>
        </Drawer>
      </>

      
    ):(
      <nav className={classes.navbar}>

          <UnstyledButton className={classes.user} size="">
              <Group>
              <Avatar name={props.userData?.name} color="initials" radius="xl">
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
          
        <div className={classes.navbarMain}>
          {props.userData?.role==="student" &&
          (<a 
            className={classes.link} 
            href={'profile'} 
            onClick={(event) => {
              event.preventDefault();
              navigate('digital-skill-wallet');
            }}>
            <Group justify="space-between" align="center" w="100%">
              <Group gap="xs" align="center">
                <IconCertificate stroke={1.5} />
                <span>Digital Skill Wallet</span>
              </Group>
              <IconArrowRight stroke={1.5} />
            </Group>
          </a>)}
          {links}
        </div>

      </nav>
    )}
    </>
  )
}
