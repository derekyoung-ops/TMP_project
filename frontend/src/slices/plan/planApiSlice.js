import { apiSlice } from "../apiSlice";
const PLANS_URL = '/api/plans';

export const planApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPlan: builder.mutation({
      query: (data) => ({
        url: PLANS_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Plan"],
    }),
    updatePlan: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${PLANS_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Plan"],
    }),
    getPlanByDate: builder.query({
      query: (data) => ({
        url: PLANS_URL,
        method: "GET",
        params: data
      }),
      providesTags: ["Plan"], // Fixed: should be providesTags for queries
    }),
    getGroupPlanByDate: builder.query({
      query: (data) => ({
        url: `${PLANS_URL}/group`,
        method: "GET",
        params: data
      }),
      providesTags: ["Plan"], 
    })
  }),
});

export const {
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useGetPlanByDateQuery,
  useGetGroupPlanByDateQuery,
} = planApiSlice;