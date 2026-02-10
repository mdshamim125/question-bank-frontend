// src/redux/features/teacherSubject/teacherSubject.api.ts
import { baseApi } from "@/redux/baseApi";
import type { IResponse } from "@/type";
import type { ITeacherSubjectAssignment } from "@/type/question/teacherSubject.type";

export const teacherSubjectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    assignTeacher: builder.mutation<
      IResponse<ITeacherSubjectAssignment>,
      Partial<ITeacherSubjectAssignment>
    >({
      query: (payload) => ({
        url: "/teacher-subjects",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["TeacherSubject"],
    }),
    getAllAssignments: builder.query<
      IResponse<ITeacherSubjectAssignment[]>,
      void
    >({
      query: () => ({
        url: "/teacher-subjects",
        method: "GET",
      }),
      providesTags: ["TeacherSubject"],
    }),
    removeAssignment: builder.mutation<IResponse<null>, number>({
      query: (id) => ({
        url: `/teacher-subjects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TeacherSubject"],
    }),

    getTeacherSubjectsByTeacherId: builder.query<
      IResponse<ITeacherSubjectAssignment[]>,
      string
    >({
      query: (teacherId) => ({
        url: `/teacher-subjects/teacher/${teacherId}`,
        method: "GET",
      }),
      providesTags: ["TeacherSubject"],
    }),
  }),
});

export const {
  useAssignTeacherMutation,
  useGetAllAssignmentsQuery,
  useRemoveAssignmentMutation,
  useGetTeacherSubjectsByTeacherIdQuery,
} = teacherSubjectApi;
