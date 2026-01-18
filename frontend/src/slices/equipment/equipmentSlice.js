import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedEquipment: null,
  isFormOpen: false,
};

const equipmentSlice = createSlice({
  name: "equipment",
  initialState,
  reducers: {
    setSelectedEquipment: (state, action) => {
      state.selectedEquipment = action.payload;
      state.isFormOpen = true;
    },

    clearSelectedEquipment: (state) => {
      state.selectedEquipment = null;
      state.isFormOpen = false;
    },

    openEquipmentForm: (state) => {
      state.isFormOpen = true;
    },

    closeEquipmentForm: (state) => {
      state.isFormOpen = false;
      state.selectedEquipment = null;
    },
  },
});

export const {
  setSelectedEquipment,
  clearSelectedEquipment,
  openEquipmentForm,
  closeEquipmentForm,
} = equipmentSlice.actions;

export default equipmentSlice.reducer;
