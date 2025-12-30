import axiosInstance from '../config/Axios-config.jsx';

const AdminChapterService = {
    getChapterById: (id) => {
        return axiosInstance.get(`/chapters/${id}`);
    },
    updateChapter: (id, data) => {
        return axiosInstance.put(`/chapters/${id}`, data);
    },
    deleteChapter: (id) => {
        return axiosInstance.delete(`/chapters/${id}`);
    },
    createChapter: (data) => {
        return axiosInstance.post(`/chapters`, data);
    }
};

export default AdminChapterService;
