import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedPlan: null,
};

const planSlice = createSlice({
  name: "plan",
  initialState,
  reducers: {
    setSelectedPlan: (state, action) => {
      state.selectedPlan = action.payload;
    },

    clearSelectedPlan: (state) => {
      state.selectedPlan = null;
    },
  },
});

export const {
  setSelectedPlan,
  clearSelectedPlan,
} = planSlice.actions;

export default planSlice.reducer;