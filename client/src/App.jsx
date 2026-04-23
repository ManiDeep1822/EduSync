import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
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

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
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
