import { createSlice } from "@reduxjs/toolkit";

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    currentTheme: "light"
  },
  reducers: {
    toggleTheme: (state) => {
      state.currentTheme = state.currentTheme === "classicDark" ? "light" : "classicDark";
    }
  }
});
export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;