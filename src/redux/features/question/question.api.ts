// src/redux/features/question/question.api.ts
import { baseApi } from "@/redux/baseApi";
import type { IResponse } from "@/type";
import type { IQuestion, IQuestionPaper } from "@/type/question/question.type";

export const questionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createQuestion: builder.mutation<IResponse<IQuestion>, Partial<IQuestion>>({
      query: (payload) => ({
        url: "/questions",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["Question"],
    }),
    getAllQuestions: builder.query<IResponse<IQuestion[]>, void>({
      query: () => ({
        url: "/questions",
        method: "GET",
      }),
      providesTags: ["Question"],
    }),
    getQuestionById: builder.query<IResponse<IQuestion>, string>({
      query: (id) => ({
        url: `/questions/${id}`,
        method: "GET",
      }),
      providesTags: ["Question"],
    }),
    updateQuestion: builder.mutation<
      IResponse<IQuestion>,
      { id: string; data: Partial<IQuestion> }
    >({
      query: ({ id, data }) => ({
        url: `/questions/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["Question"],
    }),
    deleteQuestion: builder.mutation<IResponse<null>, string>({
      query: (id) => ({
        url: `/questions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Question"],
    }),

    // ---------- QUESTION PAPERS ----------
    uploadQuestionPaper: builder.mutation<IResponse<IQuestionPaper>, FormData>({
      query: (formData) => ({
        url: "/questions/question-papers",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["QuestionPaper"],
    }),
    getAllQuestionPapers: builder.query<IResponse<IQuestionPaper[]>, void>({
      query: () => ({
        url: "/question-papers",
        method: "GET",
      }),
      providesTags: ["QuestionPaper"],
    }),
  }),
});

export const {
  useCreateQuestionMutation,
  useGetAllQuestionsQuery,
  useGetQuestionByIdQuery,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useUploadQuestionPaperMutation,
  useGetAllQuestionPapersQuery,
} = questionApi;
