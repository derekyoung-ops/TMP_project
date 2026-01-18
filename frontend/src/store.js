import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/member/authSlice';
import groupReducer from './slices/group/groupSlice';
import { apiSlice } from './slices/apiSlice';

const store = configureStore({
  reducer: {
    // Add your reducers here
    auth: authReducer,
    groups: groupReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

export default store;