import { apiSlice } from "../apiSlice";

const REALGUY_URL = "/api/realguys";

export const realguyApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getRealguyList: builder.query({
      query: () => ({
        url: REALGUY_URL,
        method: "GET",
      }),
      providesTags: ["Realguy"],
    }),

    getRealguyById: builder.query({
      query: (id) => ({
        url: `${REALGUY_URL}/${id}`,
        method: "GET",
      }),
      providesTags: ["Realguy"],
    }),

    createRealguy: builder.mutation({
      query: (data) => ({
        url: REALGUY_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Realguy"],
    }),

    updateRealguy: builder.mutation({
      query: ({ id, data }) => ({
        url: `${REALGUY_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Realguy"],
    }),

    deleteRealguy: builder.mutation({
      query: (id) => ({
        url: `${REALGUY_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Realguy"],
    }),

  }),
});

export const {
  useGetRealguyListQuery,
  useGetRealguyByIdQuery,
  useCreateRealguyMutation,
  useUpdateRealguyMutation,
  useDeleteRealguyMutation,
} = realguyApiSlice;
