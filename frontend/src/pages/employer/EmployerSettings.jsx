import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextInput,
  Textarea,
  Title,
  Group,
  Loader,
  FileInput,
  Image,
  Notification,
} from "@mantine/core";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { IconCheck } from "@tabler/icons-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function EmployerSettings() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) loadSettings();
  }, [user]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${BASE_URL}/user/${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;
      setEmail(data.email || "");
      setCompanyType(data.companyType || "");
      setDescription(data.companyDescription || "");
      setLogoPreview(data.logoUrl || "");
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = await user.getIdToken();
      let logoUrl = logoPreview;

      if (logoFile) {
        const storage = getStorage();
        const storageRef = ref(storage, `logos/${user.uid}`);
        const snapshot = await uploadBytes(storageRef, logoFile);
        logoUrl = await getDownloadURL(snapshot.ref);
      }

      await axios.put(
        `${BASE_URL}/user/update`,
        {
          email,
          companyType,
          companyDescription: description,
          logoUrl,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  if (loading) {
    return (
      <Box mt="xl">
        <Loader />
      </Box>
    );
  }

  return (
    <Box mt="md" maw={600}>
      <Title order={2} mb="md">
        Employer Settings
      </Title>

      {success && (
        <Notification icon={<IconCheck size={18} />} color="teal" mb="md">
          Settings updated successfully!
        </Notification>
      )}

      <TextInput
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        mb="sm"
      />

      <TextInput
        label="Company Type"
        value={companyType}
        onChange={(e) => setCompanyType(e.target.value)}
        mb="sm"
      />

      <Textarea
        label="Company Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        autosize
        minRows={3}
        mb="sm"
      />

      <FileInput
        label="Upload Company Logo"
        placeholder="Select image (PNG, JPG)"
        accept="image/png,image/jpeg"
        value={logoFile}
        onChange={(file) => {
          setLogoFile(file);
          if (file) setLogoPreview(URL.createObjectURL(file));
        }}
        mb="sm"
      />

      {logoPreview && (
        <Image
          src={logoPreview}
          alt="Company Logo"
          width={120}
          height={120}
          radius="md"
          mb="sm"
        />
      )}

      <Group mt="md">
        <Button onClick={handleSave}>Save Settings</Button>
      </Group>
    </Box>
  );
}
