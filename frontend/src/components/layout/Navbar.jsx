import { useState } from 'react';
import { IconCalendarStats, IconDeviceDesktopAnalytics, IconFingerprint, IconGauge, IconHome2, IconLogout, IconSettings, IconSwitchHorizontal, IconUser} from '@tabler/icons-react';
import { Center, Stack, Tooltip, UnstyledButton, Image } from '@mantine/core';
import classes from './Navbar.module.css';
import logo from '../../assets/Kanavoogle_logo.png';

import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase'; 
import { useAuth } from '../../context/AuthContext';

function NavbarLink({ icon: Icon, label, active, onClick }) {
    return (<Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton onClick={onClick} className={classes.link} data-active={active || undefined}>
        <Icon size={20} stroke={1.5}/>
      </UnstyledButton>
    </Tooltip>);
}

const mockdata = [
    { icon: IconHome2, label: 'Home' },
    { icon: IconGauge, label: 'Dashboard' },
    { icon: IconDeviceDesktopAnalytics, label: 'Analytics' },
    { icon: IconCalendarStats, label: 'Releases' },
    { icon: IconUser, label: 'Account' },
    { icon: IconFingerprint, label: 'Security' },
    { icon: IconSettings, label: 'Settings' },
];

export default function Navbar() {

  const navigate = useNavigate();
  const { setUser, setRole } = useAuth();

  // Handle logout function
  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase sign out
      setUser(null);       // Clear user state  
      setRole(null);       // Clear role state
      navigate('/login');   // Redirect to login page
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to logout');
    }
  };

  const [active, setActive] = useState(2);
  const links = mockdata.map((link, index) => (<NavbarLink {...link} key={link.label} active={index === active} onClick={() => setActive(index)}/>));
  return (<nav className={classes.navbar}>
    <Center>
      <Image src={logo} w="60px"></Image>
    </Center>

    <div className={classes.navbarMain}>
      <Stack justify="center" gap={0}>
        {links}
      </Stack>
    </div>

    <Stack justify="center" gap={0}>
      <NavbarLink icon={IconSwitchHorizontal} label="Change account"/>
      <NavbarLink icon={IconLogout} label="Logout" onClick={handleLogout}/>
    </Stack>
  </nav>);
}
