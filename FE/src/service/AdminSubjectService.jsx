import axiosInstance from '../config/Axios-config.jsx';

const AdminSubjectService = {
  // Lấy danh sách tất cả chủ đề (có phân trang)
  async getAllSubjects(params = {}) {
    const res = await axiosInstance.get('/subjects', { params });
    return res?.data || [];
  },

  // Lấy chi tiết chủ đề theo ID
  async getSubjectById(id) {
    const res = await axiosInstance.get(`/subjects/${id}`);
    return res?.data;
  },

  // Lấy sách theo chủ đề
  async getBooksBySubject(id) {
    const res = await axiosInstance.get(`/subjects/${id}/books`);
    return res?.data || [];
  },

  // Tạo chủ đề mới (Admin only)
  async createSubject(subjectData) {
    const res = await axiosInstance.post('/subjects', subjectData);
    return res;
  },

  // Cập nhật chủ đề (Admin only)
  async updateSubject(id, subjectData) {
    const res = await axiosInstance.put(`/subjects/${id}`, subjectData);
    return res;
  },

  // Xóa chủ đề (Admin only)
  async deleteSubject(id) {
    const res = await axiosInstance.delete(`/subjects/${id}`);
    return res;
  }
};

export default AdminSubjectService;
