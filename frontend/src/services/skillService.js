import axios from "../utils/axiosInstance";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function addSkill(token, skillData) {
  return axios.post(`${BASE_URL}/skill/add`, skillData, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function listSkills(token) {
  const res = await axios.get(`${BASE_URL}/skill/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function deleteSkill(token, skillId) {
  return axios.delete(`${BASE_URL}/skill/delete/${skillId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Update skill function
export async function updateSkill(token, skillId, updates) {
  return axios.put(`${BASE_URL}/skill/update/${skillId}`, updates, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
