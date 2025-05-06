import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { Burger, Container, Group, Image, Button, Drawer} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from "../../context/AuthContext";
import { useFireStoreUser } from '../../hooks/useFirestoreUser';
import classes from './Header.module.css';
import logo from '../../assets/Kanavoogle_logo.png';
import UserMenu from './UserMenu';

const links = [
    { link: '/about', label: 'Why Kanavoogle?' },
    { link: '/learn', label: 'Services' },
    { link: '/pricing', label: 'Pricing' },
    { link: '/community', label: 'Community' },
];

export default function Header() {
  const navigate = useNavigate();

  const [opened, { toggle }] = useDisclosure(false);
  const [active, setActive] = useState(null);

  const { user } = useAuth();
  const { userData } = useFireStoreUser(user)

  const items = links.map((link) => (
  <a 
    key={link.label} 
    href={link.link} 
    className={classes.link} 
    data-active={active === link.link || undefined} 
    onClick={(event) => {
      event.preventDefault();
      setActive(link.link);
      navigate(link.link);
      }}>
    {link.label}
  </a>));

  return (
  <header className={classes.header}>

    <Container fluid className={classes.inner}>
      
      <Image src={logo} w="40px" radius="md"></Image>

      <Group gap={5} visibleFrom="xs">
        {items}
      </Group>

      <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm"/>
      {/*  Determine whether user are logged in and display different content */}
      {!user ? (
        <Button variant="default" color="gray" radius="xl" onClick={() => navigate("/login")}>
          Sign in
        </Button>
      ) : (
        <UserMenu 
        userData={userData}/>
      )}
          
    </Container>
  </header>);
}
