import { apiSlice } from '../apiSlice.js';
const USERS_URL = '/api/users';

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query({
            query: () => ({
                url: `${USERS_URL}`,
                method: 'GET'
            })
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
        }),
        updateUser: builder.mutation({
            query: (userData) => ({
                url: `${USERS_URL}/profile`,
                method: 'PUT',
                body: userData,
            }),
        }),
    }),
});

export const { useGetUsersQuery, useLoginMutation, useLogoutMutation, useRegisterMutation, useUpdateUserMutation } = usersApiSlice;