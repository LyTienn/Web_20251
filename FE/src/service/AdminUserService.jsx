import axiosInstance from '../config/Axios-config.jsx';

const AdminUserService = {
  // Lấy danh sách users (có phân trang)
  async getAllUsers(params = { page: 1, limit: 10 }) {
    const res = await axiosInstance.get('/users', { params });
    return res?.data;
  },

  // Tìm kiếm users
  async searchUsers(query) {
    const res = await axiosInstance.get('/users/search', { params: { q: query } });
    return res?.data?.users || [];
  },

  // Lấy chi tiết user theo ID
  async getUserById(userId) {
    const res = await axiosInstance.get(`/users/${userId}`);
    return res?.data?.user;
  },

  // Cập nhật user (role, tier, fullName) - Admin only
  async updateUser(userId, userData) {
    const res = await axiosInstance.put(`/users/${userId}`, userData);
    return res;
  },

  // Xóa user - Admin only
  async deleteUser(userId) {
    const res = await axiosInstance.delete(`/users/${userId}`);
    return res;
  },

  // Tạo user mới - Admin only
  async createUser(userData) {
    const res = await axiosInstance.post('/users', userData);
    return res;
  }
};

export default AdminUserService;
