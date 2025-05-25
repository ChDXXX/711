import { useEffect, useState } from "react";
import {
  Box, Paper, Title, Grid, Button, Divider,
  Select, Notification, Text, Modal, Group,
} from "@mantine/core";
import {
  IconLanguage, IconMoonStars, IconTrash,
  IconCheck, IconKey, IconDownload,
} from "@tabler/icons-react";
import { useAuth } from "../../context/AuthContext";
import { db, auth } from "../../firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { deleteUser, sendPasswordResetEmail } from "firebase/auth";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";

export default function StudentSettings() {
  const { t, i18n } = useTranslation();
  const { user }    = useAuth();

  const [language, setLanguage] = useState("en");
  const [theme, setTheme]       = useState("light");
  const [saved, setSaved]       = useState(false);
  const [openDel, setOpenDel]   = useState(false);

  /* 初始加载 */
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then(snap => {
      if (!snap.exists()) return;
      const d = snap.data();
      setLanguage(d.language || "en");
      setTheme(d.theme || "light");
    });
  }, [user]);

  /* 保存首选项 */
  const save = async () => {
    await updateDoc(doc(db, "users", user.uid), { language, theme });
    i18n.changeLanguage(language);
    localStorage.setItem("i18nextLng", language);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  /* 重置密码 */
  const resetPwd = () =>
    sendPasswordResetEmail(auth, user.email).then(() =>
      alert(t("settings.resetSuccess"))
    );

  /* 导出 PDF */
  const exportPDF = () => {
    const pdf = new jsPDF();
    pdf.text("Account Settings Summary", 10, 10);
    pdf.text(`Email: ${user.email}`, 10, 20);
    pdf.text(`Language: ${language}`, 10, 30);
    pdf.text(`Theme: ${theme}`, 10, 40);
    pdf.save("settings-summary.pdf");
  };

  /* 注销账户 */
  const deleteAccount = async () => {
    await deleteDoc(doc(db, "users", user.uid));
    await deleteUser(auth.currentUser);
  };

  return (
    <Box flex={1} mt="30px">
      <Title order={2}>{t("settings.title")}</Title>

      <Paper withBorder shadow="sm" p="xl" maw={480} w="100%" radius="md" mt="10px">

        {/* Account */}
        <Title order={4} mb="sm">{t("settings.account")}</Title>
        <Group gap="sm" mb="lg">
          <Button variant="light" leftIcon={<IconKey size={16}/>} onClick={resetPwd}>
            {t("settings.resetPassword")}
          </Button>
          <Button variant="light" color="red" leftIcon={<IconTrash size={16}/>} onClick={() => setOpenDel(true)}>
            {t("settings.deleteAccount")}
          </Button>
        </Group>

        <Divider my="lg" />

        {/* Preference */}
        <Title order={4} mb="sm">{t("settings.preference")}</Title>
        <Grid gutter="lg" align="center">
          <Grid.Col span={5}>
            <Group gap={6}><IconLanguage size={18}/><Text size="sm">{t("settings.language")}</Text></Group>
          </Grid.Col>
          <Grid.Col span={7}>
            <Select
              data={[{ value:"en", label:"English" }, { value:"zh", label:"中文" }]}
              value={language}
              onChange={setLanguage}
            />
          </Grid.Col>

          <Grid.Col span={5}>
            <Group gap={6}><IconMoonStars size={18}/><Text size="sm">{t("settings.theme")}</Text></Group>
          </Grid.Col>
          <Grid.Col span={7}>
            <Select
              data={[
                { value:"light", label:t("settings.light") },
                { value:"dark",  label:t("settings.dark")  },
              ]}
              value={theme}
              onChange={setTheme}
            />
          </Grid.Col>
        </Grid>

        <Button fullWidth mt="lg" color="blue" onClick={save}>
          {t("settings.save")}
        </Button>

        {saved && (
          <Notification
            icon={<IconCheck/>}
            color="teal"
            title={t("settings.saveSuccess")}
            mt="sm"
            onClose={() => setSaved(false)}
          />
        )}
      </Paper>

      {/* 删除弹窗 */}
      <Modal opened={openDel} onClose={() => setOpenDel(false)} title={t("settings.deleteConfirm")} centered>
        <Text mb="md">{t("settings.deletePrompt")}</Text>
        <Group grow>
          <Button variant="outline" onClick={() => setOpenDel(false)}>
            {t("settings.cancel")}
          </Button>
          <Button color="red" onClick={deleteAccount}>
            {t("settings.confirm")}
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}
