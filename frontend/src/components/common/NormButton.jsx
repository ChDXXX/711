import { Button } from '@mantine/core';
import { Link } from 'react-router-dom';
import classes from "./NormButton.module.css";

export default function NormButton({ icon, label, to, style}) {
  return (
    <Button
      component={Link}
      to={to}
      leftSection={icon}
      className={classes.actionButton}
      style={style}
    >
      {label}
    </Button>
  );
}
