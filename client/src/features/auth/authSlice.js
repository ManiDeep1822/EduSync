import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  accessToken: null,
  isAuthenticated: !!localStorage.getItem('user'),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload
      state.user = user
      state.accessToken = accessToken
      state.isAuthenticated = true
      localStorage.setItem('user', JSON.stringify(user))
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      localStorage.removeItem('user')
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload
    }
  },
})

export const { setCredentials, logout, setAccessToken } = authSlice.actions
export default authSlice.reducer
