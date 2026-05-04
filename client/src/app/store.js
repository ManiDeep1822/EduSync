import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import authReducer from '../features/auth/authSlice'
import timetableReducer from '../features/timetable/timetableSlice'
import { authApi } from '../features/auth/authApi'
import { timetableApi } from '../features/timetable/timetableApi'
import { teachersApi } from '../features/teachers/teachersApi'
import { roomsApi } from '../features/rooms/roomsApi'
import { coursesApi } from '../features/courses/coursesApi'
import { batchesApi } from '../features/batches/batchesApi'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    timetable: timetableReducer,
    [authApi.reducerPath]: authApi.reducer,
    [timetableApi.reducerPath]: timetableApi.reducer,
    [teachersApi.reducerPath]: teachersApi.reducer,
    [roomsApi.reducerPath]: roomsApi.reducer,
    [coursesApi.reducerPath]: coursesApi.reducer,
    [batchesApi.reducerPath]: batchesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      timetableApi.middleware,
      teachersApi.middleware,
      roomsApi.middleware,
      coursesApi.middleware,
      batchesApi.middleware,
    ),
  devTools: false,
})

setupListeners(store.dispatch)
