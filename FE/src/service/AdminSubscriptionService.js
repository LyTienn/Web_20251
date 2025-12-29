import axiosInstance from '../config/Axios-config.jsx';

const AdminSubscriptionService = {
    getAllSubscriptions: async (params) => {
        const res = await axiosInstance.get('/subscriptions/admin/all', { params });
        return res; // axios interceptor already returns response.data
    },

    updateSubscription: async (id, data) => {
        return await axiosInstance.put(`/subscriptions/admin/${id}`, data);
    }
};

export default AdminSubscriptionService;
