import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  filterType: "group", // group | individual
  selectedMember: null,
  selectedGroup: null,
  fromDate: null,
  toDate: null,
};

const worklogSlice = createSlice({
  name: "worklog",
  initialState,
  reducers: {
    setFilterType(state, action) {
      state.filterType = action.payload;
    },
    setSelectedMember(state, action) {
      state.selectedMember = action.payload;
    },
    setSelectedGroup(state, action) {
      state.selectedGroup = action.payload;
    },
    setFromDate(state, action) {
      state.fromDate = action.payload;
    },
    setToDate(state, action) {
      state.toDate = action.payload;
    },
    resetWorklogFilters() {
      return initialState;
    },
  },
});

export const {
  setFilterType,
  setSelectedMember,
  setSelectedGroup,
  setFromDate,
  setToDate,
  resetWorklogFilters,
} = worklogSlice.actions;

export default worklogSlice.reducer;
