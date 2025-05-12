// src/components/MajorModal.jsx
import {
  Modal,
  Select,
  Button,
  Stack,
  Text
} from "@mantine/core";
import { useState } from "react";
import axios from "axios";

const majorOptions = [
  { label: "Information Technology", value: "IT" },
  { label: "Accounting", value: "Accounting" },
  { label: "Biology", value: "Biology" },
  { label: "Design", value: "Design" },
];

export default function MajorModal({ opened, onClose, user, onUpdated }) {
  const [major, setMajor] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!major) return alert("Please select a major.");

    try {
      setLoading(true);
      const token = await user.getIdToken();
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/student/update-major`,
        { major },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Major saved.");
      onUpdated(); // 通知父组件已更新
      onClose();
    } catch (err) {
      console.error("Failed to update major:", err);
      alert("Failed to update major.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={() => {}} title="Select Your Major" centered withCloseButton={false}>
      <Stack>
        <Text>Please choose your major before proceeding.</Text>
        <Select
          data={majorOptions}
          placeholder="Choose a major"
          value={major}
          onChange={setMajor}
        />
        <Button onClick={handleSubmit} loading={loading}>
          Confirm
        </Button>
      </Stack>
    </Modal>
  );
}
