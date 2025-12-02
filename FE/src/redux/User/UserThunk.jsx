import UserService from '@/service/UserService';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchAllUser = createAsyncThunk(
    'users/fetchAll',
    async ({ page = 1, limit = 10, role } = {}, { rejectWithValue }) => {
        try {
            const params = { page, limit, role };
            const res = await UserService.getAllUser(params);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Fetch all users failed');
        }
    }
);

export const fetchUserById = createAsyncThunk(
    'users/fetchById',
    async(userId, { rejectWithValue }) => {
        try {
            const res = await UserService.getUserById(userId);
            return res.data.user;
        } catch(error) {
            return rejectWithValue(error.response?.data?.message || 'Fetch user by ID failed');
        }
    }
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (userId, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/users/${userId}`);
      return userId; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Delete user failed');
    }
  }
);

export const searchUser = createAsyncThunk(
  'users/search',
  async (query, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/users/search', { params: { q: query } });
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search users failed');
    }
  }
);