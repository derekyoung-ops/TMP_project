import { apiSlice } from "../apiSlice";

const EXECUSTION_URL = '/api/executions';

export const executionApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createExecution: builder.mutation({
            query: (data) => ({
                url: EXECUSTION_URL,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["PlanExecution"]
        }),
        updateExecution: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${EXECUSTION_URL}/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["PlanExecution"]
        }),
        getExecutions: builder.query({
            query: ({ type, date, year, month, weekOfMonth }) => ({
                url: EXECUSTION_URL,
                method: "GET",
                params: { type, date, year, month, weekOfMonth },
            }),
            providesTags: ['PlanExecution'] // Fixed: should be providesTags for queries
        }),
    })
})

export const {
    useCreateExecutionMutation,
    useUpdateExecutionMutation,
    useGetExecutionsQuery,
} = executionApiSlice;