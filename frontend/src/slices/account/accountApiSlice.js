import { apiSlice } from "../apiSlice";

const ACCOUNT_URL = "/api/accounts";

export const accountApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAccounts: builder.query({
      query: () => ({
        url: ACCOUNT_URL,
        method: "GET",
      }),
      providesTags: ["Account"],
    }),

    getAccountById: builder.query({
      query: (id) => ({
        url: `${ACCOUNT_URL}/${id}`,
        method: "GET",
      }),
      providesTags: ["Account"],
    }),

    createAccount: builder.mutation({
      query: (data) => ({
        url: ACCOUNT_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Account"],
    }),

    updateAccount: builder.mutation({
      query: ({ id, data }) => ({
        url: `${ACCOUNT_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Account"],
    }),

    deleteAccount: builder.mutation({
      query: (id) => ({
        url: `${ACCOUNT_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Account"],
    }),

  }),
});

export const {
  useGetAccountsQuery,
  useGetAccountByIdQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
} = accountApiSlice;
