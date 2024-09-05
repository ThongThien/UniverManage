import { createSlice } from "@reduxjs/toolkit";
export const login_profile_Slice = createSlice({
  name: "login",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { loginSuccess, loginFailure } = login_profile_Slice.actions;

export default login_profile_Slice.reducer;
