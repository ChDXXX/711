import axios from "../utils/axiosInstance";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getStudentInfo(token, studentId) {
  const res = await axios.get(`${BASE_URL}/employer/student/${studentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getStudentSkills(token, studentId) {
  const res = await axios.get(`${BASE_URL}/employer/student/${studentId}/skills`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getSchoolOptions() {
  const res = await axios.get(`${BASE_URL}/employer/schools`);
  return res.data;
}

export const searchStudentsBySkills = async (techSkills = [], softSkills = [], token) => {
  const params = new URLSearchParams();
  if (techSkills.length) params.append("techSkills", techSkills.join(","));
  if (softSkills.length) params.append("softSkills", softSkills.join(","));

  try {
    const response = await axios.get(`${BASE_URL}/employer/search-students?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching students:", error);
    throw error;
  }
};