import { baseApi } from "@/redux/baseApi";
import type { IResponse } from "@/type";
import type { IUser } from "@/type/user/user.type";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE USER
    createUser: builder.mutation<IResponse<IUser>, Partial<IUser>>({
      query: (payload) => ({
        url: "/users",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["User"],
    }),

    // GET ALL USERS
    getAllUsers: builder.query<IResponse<IUser[]>, void>({
      query: () => ({
        url: "/users",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    // GET SINGLE USER
    getSingleUser: builder.query<IResponse<IUser>, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    // GET MY PROFILE
    getMyProfile: builder.query<IResponse<IUser>, void>({
      query: () => ({
        url: "/users/my-profile",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    // UPDATE USER ROLE
    updateUserRole: builder.mutation<
      IResponse<IUser>,
      { id: string; data: { role: string } }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useCreateUserMutation,
  useGetAllUsersQuery,
  useGetSingleUserQuery,
  useGetMyProfileQuery,
  useUpdateUserRoleMutation,
} = userApi;
