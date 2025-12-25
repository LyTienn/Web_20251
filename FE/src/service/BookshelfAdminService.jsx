import axiosInstance from '../config/Axios-config.jsx';

const BookshelfAdminService = {
  // Fetch a user's grouped library: { favorites: [...], reading: [...], total }
  async getUserLibrary(userId) {
    const res = await axiosInstance.get(`/admin/bookshelf/users/${userId}`);
    return res?.data;
  },

  // Add book to user's bookshelf with status: 'FAVORITE' | 'READING'
  async addToUserBookshelf(userId, bookId, status) {
    const res = await axiosInstance.post(`/admin/bookshelf/users/${userId}/books/${bookId}`, { status });
    return res;
  },

  // Remove book from user's bookshelf
  async removeFromUserBookshelf(userId, bookId, status) {
    const res = await axiosInstance.delete(`/admin/bookshelf/users/${userId}/books/${bookId}`, { params: { status } });
    return res;
  }
};

export default BookshelfAdminService;
