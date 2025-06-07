import {
  Box, Title, Switch, Group, Divider, Button, Text,
  Stack, Paper, TextInput, Notification, Select
} from "@mantine/core";
import {
  IconCheck, IconMail, IconKey, IconLanguage
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { sendPasswordResetEmail, updateEmail } from "firebase/auth";
import { useTranslation } from "react-i18next";

export default function EmployerSettings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [notifyByEmail, setNotifyEmail] = useState(false);
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("light");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) loadSettings();
  }, [user]);

  const loadSettings = async () => {
    const docRef = doc(db, "users", user.uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      setEmail(data.email || user.email);
      setNewEmail(data.email || user.email);
      setNotifyEmail(data.notifyByEmail || false);
      setLanguage(data.language || "en");
      setTheme(data.theme || "light");
    }
  };

  const handleSave = async () => {
    const ref = doc(db, "users", user.uid);
    await updateDoc(ref, {
      notifyByEmail,
      language,
      theme,
      email: newEmail,
    });

    if (newEmail !== user.email) {
      try {
        await updateEmail(user, newEmail);
      } catch (err) {
        console.error("Email update failed:", err.message);
        alert("Failed to update email. Please re-authenticate.");
      }
    }

    localStorage.setItem("i18nextLng", language);
    window.location.reload();

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert(t("resetSuccess"));
    } catch (err) {
      alert(t("resetFail") + ": " + err.message);
    }
  };

  return (
    <Box mt="xl">
      <Title order={2}>{t("settings")}</Title>

      <Paper withBorder shadow="xs" p="md" mt="md">
        <Stack spacing="md">
          <TextInput
            label={t("email")}
            icon={<IconMail size={16} />}
            value={newEmail}
            onChange={(e) => setNewEmail(e.currentTarget.value)}
          />

          <Group position="apart">
            <Group>
              <IconMail size={18} />
              <Text>{t("notifications")}</Text>
            </Group>
            <Switch
              checked={notifyByEmail}
              onChange={(e) => setNotifyEmail(e.currentTarget.checked)}
            />
          </Group>

          <Divider />

          <Group position="apart">
            <Group>
              <IconLanguage size={18} />
              <Text>{t("language")}</Text>
            </Group>
            <Select
              data={[
                { value: "en", label: "English" },
                { value: "zh", label: "中文" },
              ]}
              value={language}
              onChange={setLanguage}
              style={{ width: 160 }}
            />
          </Group>

          <Group position="apart">
            <Group>
              <IconKey size={18} />
              <Text>{t("theme")}</Text>
            </Group>
            <Select
              data={[
                { value: "light", label: t("light", "Light") },
                { value: "dark", label: t("dark", "Dark") },
              ]}
              value={theme}
              onChange={setTheme}
              style={{ width: 160 }}
            />
          </Group>

          <Divider />

          <Button variant="default" onClick={handleResetPassword}>
            {t("resetPassword")}
          </Button>

          <Button color="blue" onClick={handleSave}>
            {t("save")}
          </Button>

          {saved && (
            <Notification icon={<IconCheck />} color="teal" title={t("saveSuccess")} />
          )}
        </Stack>
      </Paper>
    </Box>
  );
}