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
