import React, { useEffect, useState } from "react";
import { useNavigate, Navigate, Outlet } from "react-router-dom";  

import { addSkill, listSkills, deleteSkill } from "../services/skillService";
import { uploadToIPFS } from "../ipfs/uploadToIPFS";

export default function StudentRequestSkill(){
  const [skills, setSkills] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [file, setFile] = useState(null); 
  const [uploading, setUploading] = useState(false); 
  const navigate = useNavigate();
  
  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    const token = await user.getIdToken();
    const data = await listSkills(token);
    setSkills(data);
  };

  const handleAdd = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Title and Description are required.");
      return;
    }

    let fileCid = "";

    if (file) {
      try {
        setUploading(true);
        fileCid = await uploadToIPFS(file);
      } catch (error) {
        console.error("File upload failed:", error);
        alert("Failed to upload file to IPFS.");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const token = await user.getIdToken();
    await addSkill(token, {
      title,
      description,
      level,
      createdAt: new Date().toISOString(),
      attachmentCid: fileCid || "", // save the CID if file is uploaded
    });

    setTitle("");
    setDescription("");
    setLevel("Beginner");
    setFile(null); 
    loadSkills();
  };

  const handleDelete = async (skillId) => {
    const token = await user.getIdToken();
    await deleteSkill(token, skillId);
    loadSkills();
  };
  return(
    
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
      <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ marginBottom: "10px" }}>
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
                  📎 <a href={`https://ipfs.io/ipfs/${skill.attachmentCid}`} target="_blank" rel="noopener noreferrer">
                    View Uploaded Document
                  </a>
                </div>
              )}
              {skill.verified !== undefined && (
                <span>Verified: {skill.verified ? " Yes" : " No"}<br /></span>
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
  )
}