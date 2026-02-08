/* eslint-disable @typescript-eslint/no-explicit-any */
// src/redux/features/class/class.api.ts
import { baseApi } from "@/redux/baseApi";
import type { IResponse } from "@/type";
import type { IClass } from "@/type/question/class.type";

export const classApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createClass: builder.mutation<IResponse<IClass>, Partial<IClass>>({
      query: (payload) => ({
        url: "/classes",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["Class"],
    }),
    getAllClasses: builder.query<
      { data: IClass[]; meta: any },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 5 }) => ({
        url: `/classes?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Class"],
    }),
    getClassById: builder.query<IResponse<IClass>, string>({
      query: (id) => ({
        url: `/classes/${id}`,
        method: "GET",
      }),
      providesTags: ["Class"],
    }),
    updateClass: builder.mutation<
      IResponse<IClass>,
      { id: string; data: Partial<IClass> }
    >({
      query: ({ id, data }) => ({
        url: `/classes/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["Class"],
    }),
    deleteClass: builder.mutation<IResponse<null>, string>({
      query: (id) => ({
        url: `/classes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Class"],
    }),
  }),
});

export const {
  useCreateClassMutation,
  useGetAllClassesQuery,
  useGetClassByIdQuery,
  useUpdateClassMutation,
  useDeleteClassMutation,
} = classApi;
