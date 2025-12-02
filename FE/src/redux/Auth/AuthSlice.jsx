import { createSlice } from '@reduxjs/toolkit';
import { loginUser, logoutUser, registerUser, fetchUserProfile } from './AuthThunk';

const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

const AuthSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearAuthError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.error = action.payload; // error message từ rejectWithValue
            })

            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                // state.isAuthenticated = true;
                // state.user = action.payload;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload; // error message từ rejectWithValue
            })

            .addCase(logoutUser.fulfilled, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
            })

            .addCase(fetchUserProfile.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(fetchUserProfile.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
            });
    },
});

export const { clearAuthError } = AuthSlice.actions;
export default AuthSlice.reducer;