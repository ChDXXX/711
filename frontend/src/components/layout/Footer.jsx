import { Anchor, Container, Group, Image } from '@mantine/core';
import logo from '../../assets/Kanavoogle_logo.png';
import classes from './Footer.module.css';

const links = [
    { link: '#', label: 'Contact' },
    { link: '#', label: 'Privacy' },
    { link: '#', label: 'Blog' },
    { link: '#', label: 'Careers' },
];

export default function Footer() {
    const items = links.map((link) => (
    <Anchor c="dimmed" key={link.label} href={link.link} onClick={(event) => event.preventDefault()} size="sm">
      {link.label}
    </Anchor>));
    return (<div className={classes.footer}>
      <Container className={classes.inner}>
        <Image src={logo} radius="md" w="40px"></Image>
        <Group className={classes.links}>{items}</Group>
      </Container>
    </div>);
}