// src/redux/features/subject/subject.api.ts
import { baseApi } from "@/redux/baseApi";
import type { IResponse } from "@/type";
import type { ISubject } from "@/type/question/subject.type";

export const subjectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSubject: builder.mutation<IResponse<ISubject>, Partial<ISubject>>({
      query: (payload) => ({
        url: "/subjects",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["Subject"],
    }),
    getAllSubjects: builder.query<
      IResponse<ISubject[]>,
      { page?: number; limit?: number; search?: string } | void
    >({
      query: (params) => ({
        url: "/subjects",
        method: "GET",
        params, // page, limit, search
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((subject) => ({
                type: "Subject" as const,
                id: subject.id,
              })),
              { type: "Subject", id: "LIST" },
            ]
          : [{ type: "Subject", id: "LIST" }],
    }),

    getSubjectById: builder.query<IResponse<ISubject>, string>({
      query: (id) => ({
        url: `/subjects/${id}`,
        method: "GET",
      }),
      providesTags: ["Subject"],
    }),
    updateSubject: builder.mutation<
      IResponse<ISubject>,
      { id: string; data: Partial<ISubject> }
    >({
      query: ({ id, data }) => ({
        url: `/subjects/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["Subject"],
    }),
    deleteSubject: builder.mutation<IResponse<null>, string>({
      query: (id) => ({
        url: `/subjects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Subject"],
    }),
  }),
});

export const {
  useCreateSubjectMutation,
  useGetAllSubjectsQuery,
  useGetSubjectByIdQuery,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} = subjectApi;
