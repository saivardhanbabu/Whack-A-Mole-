import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Thunk for handling user login
export const userLoginThunk = createAsyncThunk(
    'userLogin',
    async (userCred, thunkApi) => {
        try {
            const res = await axios.post('http://localhost:4001/user-api/login', userCred);

            if (res.data.message === 'login success') {
                // Store JWT token in sessionStorage
                sessionStorage.setItem('token', res.data.token);
                
                // Store user data in localStorage for persistence
                localStorage.setItem('userInfo', JSON.stringify(res.data.user));

                return res.data;
            } else {
                return thunkApi.rejectWithValue(res.data.message);
            }
        } catch (error) {
            return thunkApi.rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

// Initial state: Load from localStorage if available
const initialState = {
    isPending: false,
    currentUser: localStorage.getItem("userInfo")
        ? JSON.parse(localStorage.getItem("userInfo"))
        : null, // Load stored user data
    errorStatus: false,
    errorMessage: "",
    loginStatus: localStorage.getItem("userInfo") ? true : false, // Persist login state
};

// Create user login slice
export const userLoginSlice = createSlice({
    name: 'user-login-slice',
    initialState,
    reducers: {
        resetState: (state) => {
            state.isPending = false;
            state.currentUser = null;
            state.errorStatus = false;
            state.errorMessage = "";
            state.loginStatus = false;

            // Clear localStorage and sessionStorage on logout
            localStorage.removeItem("userInfo");
            sessionStorage.removeItem("token");
        }
    },
    extraReducers: (builder) => builder
        .addCase(userLoginThunk.pending, (state) => {
            state.isPending = true;
        })
        .addCase(userLoginThunk.fulfilled, (state, action) => {
            state.isPending = false;
            state.currentUser = action.payload.user;
            state.errorStatus = false;
            state.errorMessage = "";
            state.loginStatus = true;

            // Save to localStorage for persistence
            localStorage.setItem("userInfo", JSON.stringify(action.payload.user));
        })
        .addCase(userLoginThunk.rejected, (state, action) => {
            state.isPending = false;
            state.currentUser = null;
            state.errorStatus = true;
            state.errorMessage = action.payload;
            state.loginStatus = false;
        })
});

// Export reducer
export default userLoginSlice.reducer;

// Export actions
export const { resetState } = userLoginSlice.actions;

// Logout action to clear storage
export const logoutUser = () => (dispatch) => {
    dispatch(resetState());
};
