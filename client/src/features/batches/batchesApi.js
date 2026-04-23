import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '../../app/apiHelper'

export const batchesApi = createApi({
  reducerPath: 'batchesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Batch'],
  endpoints: (builder) => ({
    getBatches: builder.query({
      query: () => '/batches',
      providesTags: ['Batch'],
    }),
    createBatch: builder.mutation({
      query: (batch) => ({
        url: '/batches',
        method: 'POST',
        body: batch,
      }),
      invalidatesTags: ['Batch'],
    }),
    updateBatch: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/batches/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Batch'],
    }),
    deleteBatch: builder.mutation({
      query: (id) => ({
        url: `/batches/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Batch'],
    }),
  }),
})

export const { 
  useGetBatchesQuery, 
  useCreateBatchMutation, 
  useUpdateBatchMutation, 
  useDeleteBatchMutation 
} = batchesApi
