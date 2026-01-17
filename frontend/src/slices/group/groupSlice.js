import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedGroup: null,
};

const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    setSelectedGroup: (state, action) => {
      state.selectedGroup = action.payload;
    },
    clearSelectedGroup: (state) => {
      state.selectedGroup = null;
    },
  },
});

export const {
  setSelectedGroup,
  clearSelectedGroup,
} = groupSlice.actions;

export default groupSlice.reducer;