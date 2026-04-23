import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '../../app/apiHelper'

export const timetableApi = createApi({
  reducerPath: 'timetableApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Timetable'],
  endpoints: (builder) => ({
    getTimetables: builder.query({
      query: () => '/timetable',
      providesTags: ['Timetable'],
    }),
    getTimetableById: builder.query({
      query: (id) => `/timetable/${id}`,
      providesTags: (result, error, id) => [{ type: 'Timetable', id }],
    }),
    generateTimetable: builder.mutation({
      query: (data) => ({
        url: '/timetable/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Timetable'],
    }),
    updateSlot: builder.mutation({
      query: ({ id, slotIndex, updatedSlot }) => ({
        url: `/timetable/${id}/slot`,
        method: 'PUT',
        body: { slotIndex, updatedSlot },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Timetable', id }],
    }),
    publishTimetable: builder.mutation({
      query: (id) => ({
        url: `/timetable/${id}/publish`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Timetable', id }, 'Timetable'],
    }),
    getLatestByBatch: builder.query({
      query: (batchId) => `/timetable/batch/${batchId}`,
      providesTags: ['Timetable'],
    }),
    getForTeacher: builder.query({
      query: (teacherId) => `/timetable/teacher/${teacherId}`,
      providesTags: ['Timetable'],
    }),
  }),
})

export const {
  useGetTimetablesQuery,
  useGetTimetableByIdQuery,
  useGenerateTimetableMutation,
  useUpdateSlotMutation,
  usePublishTimetableMutation,
  useGetLatestByBatchQuery,
  useGetForTeacherQuery,
} = timetableApi
