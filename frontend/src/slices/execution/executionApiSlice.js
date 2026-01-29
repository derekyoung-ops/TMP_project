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
            query: ({ type, date, year, month, weekOfMonth, createdBy }) => ({
                url: EXECUSTION_URL,
                method: "GET",
                params: { type, date, year, month, weekOfMonth, createdBy },
            }),
            providesTags: ['PlanExecution'] // Fixed: should be providesTags for queries
        }),
        getGroupExecutions: builder.query({
            query: ({ type, date, year, month, weekOfMonth, createdBy, groupId }) => ({
                url: `${EXECUSTION_URL}/group`,
                method: "GET",
                params: { type, date, year, month, weekOfMonth, createdBy, groupId },
            }),
        }),
    })
})

export const {
    useCreateExecutionMutation,
    useUpdateExecutionMutation,
    useGetExecutionsQuery,
    useGetGroupExecutionsQuery,
} = executionApiSlice;