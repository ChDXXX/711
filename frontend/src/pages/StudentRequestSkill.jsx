import React, { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { addSkill, listSkills, deleteSkill } from "../services/skillService";
import { uploadToIPFS } from "../ipfs/uploadToIPFS";

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

  const loadSkills = async () => {
    try {
      const token = await user.getIdToken();
      const data = await listSkills(token);
      setSkills(data);
    } catch (error) {
      console.error("Failed to load skills:", error);
    }
  };

  const handleAdd = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Title and Description are required.");
      return;
    }

    let fileCid = "";

    if (file) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']; // PDF & DOCX
      const maxSizeMB = 5;
    
      if (!allowedTypes.includes(file.type)) {
        alert("Only PDF or DOCX files are allowed.");
        return;
      }
    
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert("File size exceeds 5MB.");
        return;
      }
    
      try {
        console.log(" Uploading file...");
        fileCid = await uploadToIPFS(file);
      } catch (error) {
        console.error(" File upload failed:", error);
        alert("Failed to upload file to IPFS.");
        return;
      }
    }

    try {
      const token = await user.getIdToken();
      await addSkill(token, {
        title,
        description,
        level,
        createdAt: new Date().toISOString(),
        attachmentCid: fileCid || "",
      });

      setTitle("");
      setDescription("");
      setLevel("Beginner");
      setFile(null);
      loadSkills();
    } catch (error) {
      console.error("Failed to add skill:", error);
      alert("Failed to save skill to Firestore");
    }
  };

  const handleDelete = async (skillId) => {
    try {
      const token = await user.getIdToken();
      await deleteSkill(token, skillId);
      loadSkills();
    } catch (error) {
      console.error("Failed to delete skill:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3 style={{ marginTop: "30px" }}>Add Skill</h3>
      <input
        placeholder="Skill title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      />
      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      />
      <select
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        style={{ marginBottom: "10px" }}
      >
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>
      </select>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ display: "block", marginBottom: "10px" }}
      />

      <button onClick={handleAdd} disabled={uploading}>
        {uploading ? "Uploading..." : "Submit Skill"}
      </button>

      <h3 style={{ marginTop: "30px" }}>Your Skills</h3>
      {skills.length === 0 ? (
        <p>No skills added yet.</p>
      ) : (
        <ul>
          {skills.map((skill) => (
            <li key={skill.id} style={{ marginBottom: "10px" }}>
              <strong>{skill.title}</strong> ({skill.level})<br />
              <em>{skill.description}</em><br />
              {skill.attachmentCid && (
                <div>
                  📎{" "}
                  <a
                    href={`https://ipfs.io/ipfs/${skill.attachmentCid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Uploaded Document
                  </a>
                </div>
              )}
              {skill.verified !== undefined && (
                <span>Verified: {skill.verified ? "Yes" : "No"}<br /></span>
              )}
              {skill.score !== undefined && (
                <span>Score: {skill.score}</span>
              )}
              <br />
              <button onClick={() => handleDelete(skill.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}