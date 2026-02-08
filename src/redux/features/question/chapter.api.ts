// src/redux/features/chapter/chapter.api.ts
import { baseApi } from "@/redux/baseApi";
import type { IResponse } from "@/type";
import type { IChapter } from "@/type/question/chapter.type";

export const chapterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createChapter: builder.mutation<IResponse<IChapter>, Partial<IChapter>>({
      query: (payload) => ({
        url: "/chapters",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["Chapter"],
    }),
    getAllChapters: builder.query<IResponse<IChapter[]>, void>({
      query: () => ({
        url: "/chapters",
        method: "GET",
      }),
      providesTags: ["Chapter"],
    }),
    getChapterById: builder.query<IResponse<IChapter>, string>({
      query: (id) => ({
        url: `/chapters/${id}`,
        method: "GET",
      }),
      providesTags: ["Chapter"],
    }),
    updateChapter: builder.mutation<
      IResponse<IChapter>,
      { id: string; data: Partial<IChapter> }
    >({
      query: ({ id, data }) => ({
        url: `/chapters/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["Chapter"],
    }),
    deleteChapter: builder.mutation<IResponse<null>, string>({
      query: (id) => ({
        url: `/chapters/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Chapter"],
    }),
  }),
});

export const {
  useCreateChapterMutation,
  useGetAllChaptersQuery,
  useGetChapterByIdQuery,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
} = chapterApi;
