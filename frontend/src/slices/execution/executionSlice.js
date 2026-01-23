import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedExecution: null,
};

const executionSlice = createSlice({
  name: "Execution",
  initialState,
  reducers: {
    setSelectedExecution: (state, action) => {
      state.selectedExecution = action.payload;
    },

    clearSelectedExecution: (state) => {
      state.selectedExecution = null;
    },
  },
});

export const {
  setSelectedExecution,
  clearSelectedExecution,
} = executionSlice.actions;

export default executionSlice.reducer;