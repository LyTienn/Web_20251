import axiosClient from "../config/Axios-config";

const AdminStatsService = {
  // Get dashboard overview stats
  getDashboardStats: async () => {
    const response = await axiosClient.get("/admin/stats");
    return response;
  },

  // Get user registration trend
  getRegistrationStats: async (period = 30) => {
    const response = await axiosClient.get(`/admin/stats/registrations?period=${period}`);
    return response;
  },

  // Get books distribution by subject
  getBooksBySubject: async () => {
    const response = await axiosClient.get("/admin/stats/books-by-subject");
    return response;
  },

  // Get recent registered users
  getRecentUsers: async (limit = 5) => {
    const response = await axiosClient.get(`/admin/stats/recent-users?limit=${limit}`);
    return response;
  },

  // Get recent comments
  getRecentComments: async (limit = 5) => {
    const response = await axiosClient.get(`/admin/stats/recent-comments?limit=${limit}`);
    return response;
  },

  // Get top books by download
  getTopBooks: async (limit = 10) => {
    const response = await axiosClient.get(`/admin/stats/top-books?limit=${limit}`);
    return response;
  },

  // Get user tier distribution
  getUserTierStats: async () => {
    const response = await axiosClient.get("/admin/stats/user-tiers");
    return response;
  },
};

export default AdminStatsService;
