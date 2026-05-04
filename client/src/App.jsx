import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import ProtectedRoute from './components/shared/ProtectedRoute'
import RoleGuard from './components/shared/RoleGuard'
import AppLayout from './components/layout/AppLayout'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TeacherManagement from './pages/TeacherManagement'
import RoomManagement from './pages/RoomManagement'
import CourseManagement from './pages/CourseManagement'
import BatchManagement from './pages/BatchManagement'
import GenerateTimetable from './pages/GenerateTimetable'
import TimetableView from './pages/TimetableView'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useGetMeQuery } from './features/auth/authApi'
import { logout } from './features/auth/authSlice'

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  
  // Only call getMe if we have a user in localStorage but no accessToken
  const { isLoading, isError } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  })

  useEffect(() => {
    if (isError) {
      dispatch(logout())
    }
  }, [isError, dispatch])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/timetable" element={<TimetableView />} />
          <Route path="/timetable/:id" element={<TimetableView />} />
          <Route path="/timetable/batch/:batchId" element={<TimetableView />} />
          
          {/* Admin Routes */}
          <Route element={<RoleGuard role="admin" />}>
            <Route path="/teachers" element={<TeacherManagement />} />
            <Route path="/rooms" element={<RoomManagement />} />
            <Route path="/courses" element={<CourseManagement />} />
            <Route path="/batches" element={<BatchManagement />} />
            <Route path="/generate" element={<GenerateTimetable />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
