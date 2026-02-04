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
            providesTags: (result, error, arg) => [
                { type: 'PlanExecution', id: `group-${arg.groupId}-${arg.type}-${arg.year}-${arg.month}-${arg.weekOfMonth}` }
            ],
        }),
        getExecutionPercentages: builder.query({
            query: ({ type = "MONTH", year, month }) => ({
                url: `${EXECUSTION_URL}/percentages`,
                method: "GET",
                params: { type, year, month },
            }),
            providesTags: ['ExecutionPercentages']
        }),
    })
})

export const {
    useCreateExecutionMutation,
    useUpdateExecutionMutation,
    useGetExecutionsQuery,
    useGetGroupExecutionsQuery,
    useGetExecutionPercentagesQuery
} = executionApiSlice;