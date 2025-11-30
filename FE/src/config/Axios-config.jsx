import axios from "axios";

const instance = axios.create({
  baseURL: "https://dummyjson.com",
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Debug headers
instance.interceptors.request.use(
  function (config) {
    console.log('Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
    });
    return config;
  },
  function (error) {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  function (response) {
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response.data; // Trả data trực tiếp
  },
  function (error) {
    console.error('Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export default instance;