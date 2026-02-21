// src/redux/features/questionHeader/questionHeader.api.ts
import { baseApi } from "@/redux/baseApi";
import type { IResponse } from "@/type";
import type { IQuestionHeader } from "@/type/question/questionHeader.type";

export const questionHeaderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createHeader: builder.mutation<IResponse<IQuestionHeader>, Partial<IQuestionHeader>>({
      query: (payload) => ({
        url: "/question-headers",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["QuestionHeader"],
    }),
    getAllHeaders: builder.query<IResponse<IQuestionHeader[]>, void>({
      query: () => ({
        url: "/question-headers",
        method: "GET",
      }),
      providesTags: ["QuestionHeader"],
    }),
    getHeaderById: builder.query<IResponse<IQuestionHeader>, string>({
      query: (id) => ({
        url: `/question-headers/${id}`,
        method: "GET",
      }),
      providesTags: ["QuestionHeader"],
    }),
    updateHeader: builder.mutation<IResponse<IQuestionHeader>, { id: string; data: Partial<IQuestionHeader> }>({
      query: ({ id, data }) => ({
        url: `/question-headers/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["QuestionHeader"],
    }),
    deleteHeader: builder.mutation<IResponse<null>, string>({
      query: (id) => ({
        url: `/question-headers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["QuestionHeader"],
    }),
  }),
});

export const {
  useCreateHeaderMutation,
  useGetAllHeadersQuery,
  useGetHeaderByIdQuery,
  useUpdateHeaderMutation,
  useDeleteHeaderMutation,
} = questionHeaderApi;
