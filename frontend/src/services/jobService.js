import axios from "../utils/axiosInstance";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// This file will handle API requests related to jobs

export const fetchJobs = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/job`,{
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};


export const createJob = async (jobData, token) => {
  try {
    const response = await axios.post(`${BASE_URL}/job`, jobData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Job created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

export const assignJob = async (jobId, studentId, token) => {
  try {
    const response = await axios.put(`${BASE_URL}/job/${jobId}/assign/${studentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Job assigned:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error assigning job:', error);
    throw error;
  }
};

export const verifyJobCompletion = async (jobId, token) => {
  try {
    const response = await axios.put(`${BASE_URL}/job/${jobId}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error('Error verifying job completion:', error);
    throw error;
  }
};