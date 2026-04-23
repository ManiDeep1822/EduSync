import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '../../app/apiHelper'

export const coursesApi = createApi({
  reducerPath: 'coursesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Course'],
  endpoints: (builder) => ({
    getCourses: builder.query({
      query: () => '/courses',
      providesTags: ['Course'],
    }),
    createCourse: builder.mutation({
      query: (course) => ({
        url: '/courses',
        method: 'POST',
        body: course,
      }),
      invalidatesTags: ['Course'],
    }),
    updateCourse: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/courses/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Course'],
    }),
    deleteCourse: builder.mutation({
      query: (id) => ({
        url: `/courses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Course'],
    }),
  }),
})

export const { 
  useGetCoursesQuery, 
  useCreateCourseMutation, 
  useUpdateCourseMutation, 
  useDeleteCourseMutation 
} = coursesApi
