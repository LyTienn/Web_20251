import axios from "axios";
import { dologout } from "@/redux/Auth/AuthSlice";
import { useDispatch } from "react-redux";

let store;

export const injectStore = (_store) => {
  store = _store;
};

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000,

});

// Request interceptor
instance.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/login')) {
      if (store) store.dispatch(dologout());
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      console.log("Access Token hết hạn. Đang tự động gia hạn...");
      await instance.post('/auth/refresh');
      console.log("Gia hạn thành công! Gửi lại request cũ.");
      return instance(originalRequest);
    } catch (refreshError) {
      console.log("Phiên đăng nhập hết hạn hẳn -> Chuyển về chế độ Khách.");
      if (store) store.dispatch(dologout());
      return Promise.reject(refreshError);
    }
  }
);

export default instance;