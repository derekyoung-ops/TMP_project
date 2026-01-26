import { apiSlice } from "../apiSlice";

const GROUPS_URL = "/api/groups";

export const groupApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // GET /api/groups
    getGroups: builder.query({
      query: () => ({
        url: GROUPS_URL,
        method: "GET",
      }),
      providesTags: ["Group"],
    }),

    // GET /api/groups/:id
    getGroupById: builder.query({
      query: (id) => ({
        url: `${GROUPS_URL}/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Group", id }],
    }),

    // POST /api/groups
    createGroup: builder.mutation({
      query: (data) => ({
        url: GROUPS_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Group"],
    }),

    // PUT /api/groups/:id
    updateGroup: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${GROUPS_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Group"],
    }),

    // DELETE /api/groups/:id
    deleteGroup: builder.mutation({
      query: (id) => ({
        url: `${GROUPS_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Group"],
    }),
  }),
});

export const {
  useGetGroupsQuery,
  useGetGroupByIdQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
} = groupApiSlice;