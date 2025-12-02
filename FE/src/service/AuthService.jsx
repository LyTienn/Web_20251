import Axios_config from '../config/Axios-config.jsx';

const AuthService = {
    login: async (credentials) => {
        const res = await Axios_config.post('/auth/login', credentials);
        return res.data.user;
    },

    register: async(userData) => {
        const res = await Axios_config.post('/auth/register', userData);
        return res.data.user;
    },

    logout: async() => {
        await Axios_config.post('/auth/logout');
    },

    getProfile: async() => {
        const res = await Axios_config.get('/users/profile');
        return res.data;
    },

    updateProfile: async(userData) => {
        const res = await Axios_config.put('/users/profile', userData);
        return res.data.user;
    },

    changePassword: async(passwordData) => {
        const res = await Axios_config.post('/users/change-password', passwordData);
        return res.data;
    },

    //USER XÓA
    deleteAccount: async(password) => {
        const res = await Axios_config.delete('/users/account', { data: { password } });
        return res.data;
    }
};

export default AuthService;