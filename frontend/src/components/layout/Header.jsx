import { useNavigate, useLocation } from 'react-router-dom';
import { Burger, Container, Group, Image, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '../../context/AuthContext';
import { useFireStoreUser } from '../../hooks/useFirestoreUser';
import classes from './Header.module.css';
<<<<<<< HEAD
import logo from '../../assets/Kanavoogle_logo.png';
import UserMenu from './UserMenu';

const links = [
    { link: '/about', label: 'Why Kanavoogle?' },
    { link: '/learn', label: 'Services' },
    { link: '/pricing', label: 'Pricing' },
    { link: '/community', label: 'Community' },
=======
import logo from '../../../public/Kanavoogle_logo.png';
import UserMenu from './UserMenu';

const links = [
  { link: '/why-kanavoogle', label: 'Why Kanavoogle' },
  { link: '/products', label: 'Products' },
  { link: '/planning-advice', label: 'Planning & Advice' },
>>>>>>> main
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [opened, { toggle }] = useDisclosure(false);

  const { user } = useAuth();
  const { userData } = useFireStoreUser(user);

  const items = links.map((l) => (
    <a
      key={l.label}
      href={l.link}
      className={classes.link}
      data-active={location.pathname === l.link || undefined}
      onClick={(e) => {
        e.preventDefault();
        navigate(l.link);
      }}
    >
      {l.label}
    </a>
  ));

  return (
    <header className={classes.header}>
      <Container fluid p={20} className={classes.inner}>
        <Image
          src={logo}
          w={150}
          className={classes.logo}
          onClick={() => navigate('/')}
        />

<<<<<<< HEAD
    <Container fluid className={classes.inner}>
      
      <Image src={logo} w="40px" radius="md"></Image>
=======
        <Group gap={5} visibleFrom="xs" className={classes.centerNav}>
          {items}
        </Group>
>>>>>>> main

        <Group gap="sm" className={classes.right}>
          <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
          {!user ? (
            <Button variant="default" radius="xl" onClick={() => navigate('/login')}>
              Sign in
            </Button>
          ) : (
            <UserMenu userData={userData} />
          )}
        </Group>
      </Container>
    </header>
  );
}
