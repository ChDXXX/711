import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Navigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DigitalSkillWallet = () => {
  const { user, role } = useAuth();
  const [email, setEmail] = useState("");
  const [customUid, setCustomUid] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [currentSchool, setCurrentSchool] = useState("");
  const [schoolList, setSchoolList] = useState([]);
  const [newSchool, setNewSchool] = useState("");
  const [updating, setUpdating] = useState(false);

  if (!user || role !== "student") return <Navigate to="/" />;

  useEffect(() => {
    loadProfile();
    loadSchoolOptions();
  }, []);

  const loadProfile = async () => {
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${BASE_URL}/student/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      setEmail(data.email);
      setCustomUid(data.customUid || "");
      setWalletAddress(data.walletAddress || "");
      setCurrentSchool(data.schoolId || "");
      setNewSchool(data.schoolId || "");
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  const loadSchoolOptions = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/employer/schools`);
      setSchoolList(res.data); // [{ code, name }]
    } catch (error) {
      console.error("Failed to load school list:", error);
    }
  };

  const updateSchool = async () => {
    if (!newSchool) {
      alert("Please select a school.");
      return;
    }
    if (newSchool === currentSchool) {
      alert("School unchanged.");
      return;
    }

    setUpdating(true);
    try {
      const token = await user.getIdToken();
      await axios.put(
        `${BASE_URL}/student/update-school`,
        { schoolId: newSchool },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("School updated successfully.");
      setCurrentSchool(newSchool);
    } catch (error) {
      alert("Failed to update school.");
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Student Profile</h2>
      <p>Email: {email}</p>
      <p>Role: {role}</p>
      {customUid && <p>Student ID: {customUid}</p>}
      {walletAddress && <p>Wallet Address: {walletAddress}</p>}
      <p>Current School: {currentSchool || "Not set"}</p>

      <h4>Change School</h4>
      <select value={newSchool} onChange={(e) => setNewSchool(e.target.value)}>
        <option value="">-- Select School --</option>
        {schoolList.map((school) => (
          <option key={school.code} value={school.code}>
            {school.name}
          </option>
        ))}
      </select>
      <br />
      <button onClick={updateSchool} disabled={updating || newSchool === currentSchool}>
        {updating ? "Updating..." : "Update School"}
      </button>
    </div>
  );
};

export default DigitalSkillWallet;