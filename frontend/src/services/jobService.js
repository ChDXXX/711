import axios from "../utils/axiosInstance";

// This file will handle API requests related to jobs

export const fetchJobs = async (token) => {
  try {
    console.log("🚀 JobService: Starting fetchJobs request");
    console.log("🎫 Token length:", token ? token.length : "No token");
    console.log("🌐 Request URL: /job (通过Vite代理)");
    
    const response = await axios.get("/job", {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    console.log("📦 JobService: Response received");
    console.log("📊 Status:", response.status);
    console.log("📋 Data length:", response.data ? response.data.length : "No data");
    
    return response.data;
  } catch (error) {
    console.error("❌ JobService: Error fetching jobs:", error);
    console.error("🔍 Error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw error;
  }
};

export const createJob = async (jobData, token) => {
  try {
    const response = await axios.post("/job", jobData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Job created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
};

export const fetchJobById = async (jobId, token) => {
  try {
    const response = await axios.get(`/job/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching job by ID:", error);
    throw error;
  }
};

export const updateJob = async (jobId, jobData, token) => {
  try {
    console.log("🔄 JobService: Updating job", jobId);
    console.log("📦 Update data:", jobData);
    console.log("🌐 Request URL:", `/job/${jobId}`);
    
    const response = await axios.put(`/job/${jobId}`, jobData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    console.log("✅ JobService: Job updated successfully");
    console.log("📊 Response status:", response.status);
    console.log("📋 Response data:", response.data);
    
    return response.data;
  } catch (error) {
    console.error("❌ JobService: Error updating job:", error);
    console.error("🔍 Error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw error;
  }
};

export const findStudentsBySkill = async (skill, token, softSkills = []) => {
  try {
    console.log("🔍 JobService: 正在按技能查询学生:", skill);
    console.log("🎫 Token length:", token ? token.length : "No token");
    console.log("🧩 包含软技能:", softSkills);
    
    const softSkillQuery = softSkills.join(",");
    const url = `/employer/students/skills/${skill}?softSkills=${softSkillQuery}`;
    console.log("🌐 请求URL:", url);
    
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    console.log("✅ JobService: 查询学生成功，找到", response.data?.length || 0, "名学生");
    console.log("📊 Response status:", response.status);
    return response.data;
  } catch (error) {
    console.error("❌ JobService: 查询学生失败:", error);
    console.error("🔍 Error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw error;
  }
};

export const assignJob = async (jobId, studentId, token) => {
  try {
    const response = await axios.put(
      `/job/${jobId}/assign/${studentId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("Job assigned:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error assigning job:", error);
    throw error;
  }
};

export const verifyJobCompletion = async (jobId, token) => {
  try {
    console.log("✅ JobService: Verifying job completion", jobId);
    const response = await axios.put(
      `/job/${jobId}/verify`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("✅ JobService: Job verification successful");
    return response.data;
  } catch (error) {
    console.error("❌ JobService: Error verifying job completion:", error);
    throw error;
  }
};

export const deleteJob = async (jobId, token) => {
  try {
    const response = await axios.delete(`/job/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Job deleted:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting job:", error);
    throw error;
  }
};

export const fetchSoftSkills = async (token) => {
  try {
    console.log("🔍 JobService: 获取软技能列表");
    console.log("🎫 Token length:", token ? token.length : "No token");
    console.log("🌐 请求URL:", "/employer/soft-skills");
    
    const response = await axios.get("/employer/soft-skills", {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    console.log("✅ JobService: 获取软技能成功，找到", response.data?.length || 0, "个软技能");
    console.log("📊 Response status:", response.status);
    return response.data;
  } catch (error) {
    console.error("❌ JobService: 获取软技能失败:", error);
    console.error("🔍 Error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw error;
  }
};

// Amir
export const acceptJob = async (jobId, token) => {
  try {
    console.log("✅ JobService: Accepting job", jobId);
    const response = await axios.put(`/job/${jobId}/accept`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("✅ JobService: Job accepted successfully");
    return response.data; // e.g., "Job accepted"
  } catch (error) {
    console.error("❌ JobService: Error accepting job:", error.response?.data || error.message);
    throw error;
  }
};

export const rejectJob = async (jobId, token) => {
  try {
    console.log("❌ JobService: Rejecting job", jobId);
    const response = await axios.put(`/job/${jobId}/reject`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("❌ JobService: Job rejected successfully");
    return response.data; // e.g., "Job rejected"
  } catch (error) {
    console.error("❌ JobService: Error rejecting job:", error.response?.data || error.message);
    throw error;
  }
};

export const completeJob = async (jobId, token) => {
  try {
    console.log("🎯 JobService: Completing job", jobId);
    const response = await axios.put(
      `/job/${jobId}/complete`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("🎯 JobService: Job completed successfully");
    return response.data; // e.g., "Job marked as completed"
  } catch (error) {
    console.error("❌ JobService: Error completing job:", error.response?.data || error.message);
    throw error;
  }
};
