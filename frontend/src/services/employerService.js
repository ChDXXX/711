import axios from "../utils/axiosInstance";

export async function getStudentInfo(token, studentId) {
  const res = await axios.get(`/employer/student/${studentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getStudentSkills(token, studentId) {
  const res = await axios.get(`/employer/student/${studentId}/skills`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getSchoolOptions() {
  const res = await axios.get(`/employer/schools`);
  return res.data;
}

export const searchStudentsBySkills = async (techSkills = [], softSkills = [], token) => {
  const params = new URLSearchParams();
  if (techSkills.length) params.append("techSkills", techSkills.join(","));
  if (softSkills.length) params.append("softSkills", softSkills.join(","));

  try {
    console.log("🔍 EmployerService: 搜索学生技能");
    console.log("📝 技术技能:", techSkills);
    console.log("📝 软技能:", softSkills);
    console.log("🌐 请求URL:", `/employer/search-students?${params.toString()}`);
    
    const response = await axios.get(`/employer/search-students?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    console.log("✅ EmployerService: 搜索成功，找到", response.data?.length || 0, "名学生");
    return response.data;
  } catch (error) {
    console.error("❌ EmployerService: 搜索学生失败:", error);
    console.error("🔍 Error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw error;
  }
};
