import AuthService from '@/service/AuthService';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const loginUser = createAsyncThunk(
    'auth/login',
    async(credentials, { rejectWithValue }) => {
        try {
            return await AuthService.login(credentials);
        } catch(error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async(userData, { rejectWithValue }) => {
        try {
            return await AuthService.register(userData);
        } catch(error) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async(_, { rejectWithValue }) => {
        try {
            await AuthService.logout();
            return true;
        } catch(error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchUserProfile = createAsyncThunk(
    'auth/profile', 
    async(_, { rejectWithValue }) => {
        try {
            return await AuthService.getProfile();
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Fetch profile failed');
        }
    }
);