import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  activeWeek: new Date().toISOString().split('T')[0],
  selectedBatch: null,
  viewMode: 'batch', // 'batch' | 'teacher'
}

const timetableSlice = createSlice({
  name: 'timetable',
  initialState,
  reducers: {
    setActiveWeek: (state, action) => {
      state.activeWeek = action.payload
    },
    setSelectedBatch: (state, action) => {
      state.selectedBatch = action.payload
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload
    },
  },
})

export const { setActiveWeek, setSelectedBatch, setViewMode } = timetableSlice.actions
export default timetableSlice.reducer
