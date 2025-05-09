import { Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import classes from "../pages/DigitalSkillWallet.module.css";

function AlertBox({ onClose, title, children }) {
  return (
    <div className={classes.alert}>
      <Alert
        withCloseButton
        onClose={onClose}
        closeButtonLabel="Dismiss"
        classNames={{
          root: classes.alert_root,
          title: classes.alert_title,
          message: classes.alert_message,
          closeButton: classes.alert_closeButton
        }}
        variant="filled"
        icon={<IconInfoCircle color="var(--mantine-color-white)" />}
        title={title}
      >
        {children}
      </Alert>
    </div>
  );
}

export default AlertBox;
