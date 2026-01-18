import { apiSlice } from '../apiSlice.js';
const USERS_URL = '/api/users';

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query({
            query: () => ({
                url: `${USERS_URL}`,
                method: 'GET',
            }),
            providesTags: ["Users"],
        }),
        login: builder.mutation({
            query: (credentials) => ({
                url: `${USERS_URL}/auth`,
                method: 'POST',
                body: credentials,
            }),
        }),
        logout: builder.mutation({
            query: () => ({
                url: `${USERS_URL}/logout`,
                method: 'POST',
            }),
        }),
        register: builder.mutation({
            query: (userData) => ({ 
                url: `${USERS_URL}/register`,
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ["Users"],
        }),
        updateUser: builder.mutation({
            query: (userData) => ({
                url: `${USERS_URL}/profile`,
                method: 'PUT',
                body: userData,
            }),
            invalidatesTags: ["Users"],
        }),
        deleteUser: builder.mutation({
            query: (memberData) => ({
                url: `${USERS_URL}/delete`,
                method: "POST",
                body: memberData
            }),
            invalidatesTags: ["Users"]
        }),
    }),
});

export const { useGetUsersQuery, useLoginMutation, useLogoutMutation, useRegisterMutation, useUpdateUserMutation, useDeleteUserMutation } = usersApiSlice;