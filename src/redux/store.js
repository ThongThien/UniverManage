import { configureStore } from "@reduxjs/toolkit";
import loginProfileSlice from "../redux/login-profile-Slice";
import themeReducer from "./themeSlice";

const store = configureStore({
  reducer: {
    login: loginProfileSlice,
    theme: themeReducer,
  },
});

export default store;
