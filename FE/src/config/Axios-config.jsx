import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Debug headers
instance.interceptors.request.use(
  function (config) {
    if (import.meta.env.DEV) {
        console.log(`Request: ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    return response.data; // Giữ nguyên logic trả về data
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 && 
      (originalRequest.url.includes('/login') || originalRequest.url.includes('/auth/login'))
    ) {
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default instance;