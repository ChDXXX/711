import axios from "axios";

// 开发环境使用Vite代理，生产环境使用云端Functions
const getBaseURL = () => {
  if (import.meta.env.DEV) {
    // 本地开发：使用Vite代理到Functions模拟器
    return '/api';
  } else {
    // 生产环境：使用云端Functions
    return import.meta.env.VITE_API_BASE_URL || 'https://us-central1-digital-skill-wallet.cloudfunctions.net/api';
  }
};

const instance = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // 增加到30秒超时
  // 添加重试机制
  retry: 3,
  retryDelay: 1000,
});

// 添加请求拦截器
instance.interceptors.request.use(
  (config) => {
    console.log(`Making request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API请求失败:', error.message);
    if (error.code === 'ECONNABORTED') {
      console.error('请求超时，请检查网络连接或代理设置');
    }
    return Promise.reject(error);
  }
);

export default instance;
