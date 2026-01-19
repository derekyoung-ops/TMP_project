import { apiSlice } from "../apiSlice";

const SERVICE_URL = "/api/services";

export const serviceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getServiceList: builder.query({
      query: () => SERVICE_URL,
      providesTags: ["Service"],
    }),

    createService: builder.mutation({
      query: (data) => ({
        url: SERVICE_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Service"],
    }),

    updateService: builder.mutation({
      query: ({ id, data }) => ({
        url: `${SERVICE_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Service"],
    }),

    deleteService: builder.mutation({
      query: (id) => ({
        url: `${SERVICE_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Service"],
    }),
  }),
});

export const {
  useGetServiceListQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = serviceApiSlice;
