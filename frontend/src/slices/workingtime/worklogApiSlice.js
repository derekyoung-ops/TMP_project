import { apiSlice } from "../apiSlice";

const WORKLOGS_URL = "/api/worklogs";

export const worklogApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // GET /api/worklogs
    getWorkLogs: builder.query({
      query: ({ member, group, fromDate, toDate }) => {
        const params = new URLSearchParams();

        if (member) params.append("member", member);
        if (group) params.append("group", group);
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);

        return {
          url: `${WORKLOGS_URL}?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["WorkLog"],
    }),

    // POST /api/worklogs/add-time
    addTimeToMember: builder.mutation({
      query: ({ memberId, totalSeconds, description, date }) => ({
        url: `${WORKLOGS_URL}/add-time`,
        method: "POST",
        body: { memberId, totalSeconds, description, date },
      }),
      invalidatesTags: ["WorkLog"],
    }),

  }),
});

export const {
  useGetWorkLogsQuery,
  useAddTimeToMemberMutation,
} = worklogApiSlice;
