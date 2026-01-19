import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedRealguy: null,
};

const realguySlice = createSlice({
  name: "realguy",
  initialState,
  reducers: {
    setSelectedRealguy: (state, action) => {
      state.selectedRealguy = action.payload;
    },

    clearSelectedRealguy: (state) => {
      state.selectedRealguy = null;
    },
  },
});

export const {
  setSelectedRealguy,
  clearSelectedRealguy,
} = realguySlice.actions;

export default realguySlice.reducer;