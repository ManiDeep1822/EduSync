import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '../../app/apiHelper'

export const roomsApi = createApi({
  reducerPath: 'roomsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Room'],
  endpoints: (builder) => ({
    getRooms: builder.query({
      query: () => '/rooms',
      providesTags: ['Room'],
    }),
    createRoom: builder.mutation({
      query: (room) => ({
        url: '/rooms',
        method: 'POST',
        body: room,
      }),
      invalidatesTags: ['Room'],
    }),
    updateRoom: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/rooms/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Room'],
    }),
    deleteRoom: builder.mutation({
      query: (id) => ({
        url: `/rooms/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Room'],
    }),
  }),
})

export const { 
  useGetRoomsQuery, 
  useCreateRoomMutation, 
  useUpdateRoomMutation, 
  useDeleteRoomMutation 
} = roomsApi
