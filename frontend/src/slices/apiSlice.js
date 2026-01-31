import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
    baseUrl: 'http://192.168.10.116:5000',
    credentials: 'include',
});

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery,
    tagTypes: ['User', 'Group', 'Equipment', 'Project', 'Account', 'Realguy', 'Plan', 'Execution'],
    endpoints: (builder) => ({}),
});