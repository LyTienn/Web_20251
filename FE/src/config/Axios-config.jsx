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
  function (response) {
    return response.data; // Trả data trực tiếp
  },
  async function (error) {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu để tránh lặp vô hạn

      try {
        // Gọi API refresh token (Backend sẽ đọc refresh token từ cookie)
        await instance.post('/auth/refresh');
        
        // Nếu refresh thành công, gọi lại request ban đầu
        return instance(originalRequest);
      } catch (refreshError) {
        // Nếu refresh cũng lỗi (hết hạn cả 2 token) -> Logout
        console.error("Session expired. Please login again.");
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    console.error('API Error:', error.response?.data?.message || error.message);
    return Promise.reject(error.response?.data || error);
  }
);

export default instance;