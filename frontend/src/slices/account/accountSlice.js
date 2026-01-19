import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedAccount: null,
  isFormOpen: false,
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {

    setSelectedAccount: (state, action) => {
      state.selectedAccount = action.payload;
      state.isFormOpen = true;
    },

    clearSelectedAccount: (state) => {
      state.selectedAccount = null;
      state.isFormOpen = false;
    },

    openAccountForm: (state) => {
      state.isFormOpen = true;
    },

    closeAccountForm: (state) => {
      state.isFormOpen = false;
      state.selectedAccount = null;
    },
  },
});

export const {
  setSelectedAccount,
  clearSelectedAccount,
  openAccountForm,
  closeAccountForm,
} = accountSlice.actions;

export default accountSlice.reducer;
