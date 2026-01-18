import { apiSlice } from "../apiSlice";

const EQUIPMENT_URL = "/api/equipments";

export const equipmentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEquipment: builder.query({
      query: () => ({
        url: EQUIPMENT_URL,
        method: "GET",
      }),
      providesTags: ["Equipment"],
    }),

    getEquipmentById: builder.query({
      query: (id) => ({
        url: `${EQUIPMENT_URL}/${id}`,
        method: "GET",
      }),
      providesTags: ["Equipment"],
    }),

    createEquipment: builder.mutation({
      query: (data) => ({
        url: EQUIPMENT_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Equipment"],
    }),

    updateEquipment: builder.mutation({
      query: ({ id, data }) => ({
        url: `${EQUIPMENT_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Equipment"],
    }),

    deleteEquipment: builder.mutation({
      query: (id) => ({
        url: `${EQUIPMENT_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Equipment"],
    }),
  }),
});

export const {
  useGetEquipmentQuery,
  useGetEquipmentByIdQuery,
  useCreateEquipmentMutation,
  useUpdateEquipmentMutation,
  useDeleteEquipmentMutation,
} = equipmentApiSlice;
