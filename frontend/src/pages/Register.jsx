import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
  Select,
} from "@mantine/core";
import { useTranslation } from "react-i18next";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

import { ethers } from "ethers";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { registerStudentOnChain } from "../services/blockchain";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Register() {
  const { t } = useTranslation();
  const { setUser, setRole: setGlobalRole } = useAuth();
  const navigate = useNavigate();

  const [schoolOptions, setSchoolOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [emailWarning, setEmailWarning] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordWarning, setPasswordWarning] = useState(false);

  const [confirmPwd, setConfirmPwd] = useState("");
  const [confirmPwdWarning, setConfirmPwdWarning] = useState(false);

  const [role, setRole] = useState("student");
  const [schoolId, setSchoolId] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => {
    fetchSchoolList();
  }, []);

  useEffect(() => {
    setConfirmPwdWarning(confirmPwd !== "" && confirmPwd !== password);
  }, [password, confirmPwd]);

  const fetchSchoolList = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/employer/schools`);
      setSchoolOptions(res.data);
    } catch (error) {
      console.error("Failed to fetch school list:", error);
      alert(t("register.fetchSchoolFail"));
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = (val) => {
    setEmail(val);
    const valid = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(val);
    setEmailWarning(val !== "" && !valid);
  };

  const handlePassword = (val) => {
    setPassword(val);
    const tooShort = val.length < 6;
    const hasLetter = /[a-zA-Z]/.test(val);
    const hasNumber = /[0-9]/.test(val);
    setPasswordWarning(val !== "" && (tooShort || !hasLetter || !hasNumber));
  };

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPwd) {
      return alert(t("register.completeAllFields"));
    }
    if (emailWarning || passwordWarning || confirmPwdWarning) {
      return alert(t("register.fixErrors"));
    }
    if ((role === "student" || role === "school") && !schoolId) {
      return alert(t("register.selectSchool"));
    }
    if (!isAgreed) {
      return alert(t("register.agreeFirst"));
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const wallet = ethers.Wallet.createRandom();
      const prefix = role === "student" ? "S" : role === "school" ? "T" : "E";
      const customUid = `${prefix}-${user.uid}`;

      const userData = {
        name: username,
        email: user.email,
        role,
        walletAddress: wallet.address,
        customUid,
        createdAt: serverTimestamp(),
      };

      if (role === "student" || role === "school") {
        userData.schoolId = schoolId;
      }

      await setDoc(doc(db, "users", user.uid), userData);
      
      // 上传学生数据到区块链
      if (role === "student") {
        const txHash = await registerStudentOnChain(
          customUid,
          user.email,
          username,
          schoolId,
          wallet.address
        );
        console.log(`学生数据已上传到区块链，交易哈希: ${txHash}`);
      }
      // 上传学生数据到区块链


      setUser(user);
      setGlobalRole(role);

      if (role === "student") navigate("/student");
      else if (role === "school") navigate("/school");
      else navigate("/employer");

      alert(
        `${t("register.success")}\n\n${t("register.wallet")}: ${wallet.address}\n\n${t("register.mnemonic")}\n${wallet.mnemonic.phrase}`
      );
    } catch (err) {
      alert(err.message || t("register.fail"));
    }
  };

  if (loading) return <p>{t("register.loading")}</p>;

  return (
    <Container size={420} my={40}>
      <Title ta="center">{t("register.title")}</Title>
      <Text size="lg" ta="center" mt={18}>
        {t("register.subtitle")}
      </Text>

      <Paper withBorder shadow="md" p={30} mt={20} radius="md">
        <TextInput
          label={t("register.username")}
          placeholder={t("register.usernamePlaceholder")}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <TextInput
          label={t("register.email")}
          placeholder={t("register.emailPlaceholder")}
          value={email}
          onChange={(e) => handleEmail(e.target.value)}
          required
          mt="md"
        />
        {emailWarning && (
          <Text c="red" size="sm">
            {t("register.emailInvalid")}
          </Text>
        )}

        <PasswordInput
          label={t("register.password")}
          placeholder="******"
          value={password}
          onChange={(e) => handlePassword(e.target.value)}
          required
          mt="md"
        />
        {passwordWarning && (
          <Text c="red" size="sm">
            {t("register.passwordRules")}
          </Text>
        )}

        <PasswordInput
          label={t("register.confirmPwd")}
          placeholder="******"
          value={confirmPwd}
          onChange={(e) => setConfirmPwd(e.target.value)}
          required
          mt="md"
        />
        {confirmPwdWarning && (
          <Text c="red" size="sm">
            {t("register.passwordMismatch")}
          </Text>
        )}

        <Select
          label={t("register.role")}
          value={role}
          onChange={setRole}
          mt="md"
          data={[
            { value: "student", label: t("register.roles.student") },
            { value: "school", label: t("register.roles.teacher") },
            { value: "employer", label: t("register.roles.employer") },
          ]}
        />

        {(role === "student" || role === "school") && (
          <Select
            label={t("register.school")}
            placeholder={t("register.selectSchoolPlaceholder")}
            value={schoolId}
            onChange={setSchoolId}
            data={schoolOptions.map((s) => ({ value: s.code, label: s.name }))}
            mt="md"
          />
        )}

        <Group justify="space-between" mt="lg">
          <Checkbox
            label={t("register.agreement")}
            onChange={(e) => setIsAgreed(e.target.checked)}
          />
        </Group>

        <Button fullWidth mt="lg" onClick={handleRegister}>
          {t("register.registerBtn")}
        </Button>

        <Group mt="md" justify="center">
          <Text size="sm">{t("register.haveAccount")}</Text>
          <Anchor fw={700} component="button" size="sm" onClick={() => navigate("/login")}>
            {t("register.login")}
          </Anchor>
        </Group>
      </Paper>
    </Container>
  );
}
