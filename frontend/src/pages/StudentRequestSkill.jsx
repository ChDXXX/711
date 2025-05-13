import React, { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { addSkill, listSkills, deleteSkill } from "../services/skillService";
import { uploadToIPFS } from "../ipfs/uploadToIPFS";
import { recordSkillOnChain } from "../services/blockchain";

export default function StudentRequestSkill() {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" />;

  useEffect(() => {
    loadSkills();
  }, []);

  async function loadSkills() {
    try {
      const token = await user.getIdToken();
      const data = await listSkills(token);
      setSkills(data);
    } catch (error) {
      console.error("Failed to load skills:", error);
    }
  }

  async function handleAdd() {
    if (!title.trim() || !description.trim()) {
      alert("Title and Description are required.");
      return;
    }

    let fileCid = "";
    if (file) {
      const allowed = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ];
      const maxSizeMB = 5;
      if (!allowed.includes(file.type) || file.size > maxSizeMB * 1024 * 1024) {
        alert("Invalid file type or size.");
        return;
      }
      try {
        setUploading(true);
        fileCid = await uploadToIPFS(file);
      } catch (error) {
        console.error("File upload failed:", error);
        alert("Failed to upload file to IPFS.");
        setUploading(false);
        return;
      }
    }

    try {
      const token = await user.getIdToken();
      const response = await addSkill(token, {
        title,
        description,
        level,
        createdAt: new Date().toISOString(),
        attachmentCid: fileCid
      });
      const addedSkills = response.data;
      // 找到刚创建那条记录
      const newSkill = addedSkills.find(
        (s) => s.attachmentCid === fileCid && s.title === title
      );
      // 上链记录
      await recordSkillOnChain({
        courseId:   newSkill.courseId,
        ownerId:    newSkill.ownerId,
        description:newSkill.description,
        level:      newSkill.level,
        schoolId:   newSkill.schoolId,
        title:      newSkill.title,
        status:     newSkill.verified
      });
      setTitle("");
      setDescription("");
      setLevel("Beginner");
      setFile(null);
      loadSkills();
    } catch (error) {
      console.error("Failed to add skill:", error);
      alert("Failed to save skill.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(skillId) {
    try {
      const token = await user.getIdToken();
      await deleteSkill(token, skillId);
      loadSkills();
    } catch (error) {
      console.error("Failed to delete skill:", error);
    }
  }

  return (
    <div>
      {/* 省略表单和列表渲染 */}
      <button onClick={handleAdd} disabled={uploading}>
        {uploading ? "Uploading…" : "Submit Skill"}
      </button>
    </div>
  );
}
