import { createSlice } from "@reduxjs/toolkit";
import { fetchAllUser, fetchUserById, deleteUser, searchUser } from "./UserThunk";

const initialState = {
    list: [],
    isLoading: false,
    error: null,
    selectedUser: null,
    total: 0,
    currentPage: 1,
    totalPages: 1,
};

const UserSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        clearSelectedUser: (state) => {
            state.selectedUser = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.list = action.payload.users;
                state.total = action.payload.total;
                state.currentPage = action.payload.page;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchAllUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(fetchUserById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedUser = action.payload;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(searchUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.list = action.payload.users;
                state.total = action.payload.users.length; // Cập nhật tổng số người dùng dựa trên kết quả tìm kiếm
            })

            .addCase(deleteUser.fulfilled, (state, action) => {
                state.list = state.list.filter(user => user._id !== action.payload);
            });
    },
});

export const { clearSelectedUser } = UserSlice.actions; 
export default UserSlice.reducer;