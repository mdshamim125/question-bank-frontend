import { baseApi } from "@/redux/baseApi";

export const questionPaperApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Create Question Paper
    createQuestionPaper: builder.mutation({
      query: ({ data }) => ({
        url: "/questionPapers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["QuestionPaper"],
    }),

    // ✅ Get All Question Papers (with pagination + filter)
    getAllQuestionPapers: builder.query({
      query: (params) => ({
        url: "/questionPapers",
        method: "GET",
        params,
      }),
      providesTags: ["QuestionPaper"],
    }),

    // ✅ Get Single Question Paper by ID
    getSingleQuestionPaper: builder.query({
      query: (id) => ({
        url: `/question-papers/${id}`,
        method: "GET",
      }),
      providesTags: ["QuestionPaper"],
    }),

    // ✅ Update Question Paper
    updateQuestionPaper: builder.mutation({
      query: ({ id, data }) => ({
        url: `/question-papers/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["QuestionPaper"],
    }),

    // ✅ Delete Question Paper
    deleteQuestionPaper: builder.mutation({
      query: (id) => ({
        url: `/question-papers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["QuestionPaper"],
    }),
  }),
});

export const {
  useCreateQuestionPaperMutation,
  useGetAllQuestionPapersQuery,
  useGetSingleQuestionPaperQuery,
  useUpdateQuestionPaperMutation,
  useDeleteQuestionPaperMutation,
} = questionPaperApi;
