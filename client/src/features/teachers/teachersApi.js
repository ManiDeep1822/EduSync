import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '../../app/apiHelper'

export const teachersApi = createApi({
  reducerPath: 'teachersApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Teacher'],
  endpoints: (builder) => ({
    getTeachers: builder.query({
      query: () => '/teachers',
      providesTags: ['Teacher'],
    }),
    createTeacher: builder.mutation({
      query: (teacher) => ({
        url: '/teachers',
        method: 'POST',
        body: teacher,
      }),
      invalidatesTags: ['Teacher'],
    }),
    updateTeacher: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/teachers/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Teacher'],
    }),
    deleteTeacher: builder.mutation({
      query: (id) => ({
        url: `/teachers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Teacher'],
    }),
  }),
})

export const { 
  useGetTeachersQuery, 
  useCreateTeacherMutation, 
  useUpdateTeacherMutation, 
  useDeleteTeacherMutation 
} = teachersApi
