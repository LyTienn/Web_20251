import axiosInstance from '../config/Axios-config.jsx';

const AdminBookService = {
  // Lấy danh sách tất cả sách
  async getAllBooks(params = {}) {
    const res = await axiosInstance.get('/books', { params });
    return res?.data || [];
  },

  // Lấy chi tiết sách theo ID
  async getBookById(id) {
    const res = await axiosInstance.get(`/books/${id}`);
    return res?.data;
  },

  // Tạo sách mới (Admin only)
  async createBook(bookData) {
    const res = await axiosInstance.post('/books', bookData);
    return res;
  },

  // Cập nhật sách (Admin only)
  async updateBook(id, bookData) {
    const res = await axiosInstance.put(`/books/${id}`, bookData);
    return res;
  },

  // Xóa sách (Admin only)
  async deleteBook(id) {
    const res = await axiosInstance.delete(`/books/${id}`);
    return res;
  },

  // Lấy danh sách chương của sách
  async getBookChapters(id) {
    const res = await axiosInstance.get(`/books/${id}/chapters`);
    return res?.data || [];
  }
};

export default AdminBookService;
