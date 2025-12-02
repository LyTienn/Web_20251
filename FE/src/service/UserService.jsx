import Axios_config from '../config/Axios-config.jsx';

const UserService = {
    getAllUser: async (params) => {
        const res = await Axios_config.get("/users", { params });
        return res.data; 
    },

    searchUser: async (query) => {
        const res = await Axios_config.get("/users/search", { params: { q: query } });
        return res.data;
    },

    getUserById: async (userId) => {
        const res = await Axios_config.get(`/users/${userId}`);
        return res.data;
    },
    
    //ADMIN XÓA
    deleteUser: async(userId) => {
        const res = await Axios_config.delete(`/users/${userId}`);
        return res.data;
    }
};

export default UserService;