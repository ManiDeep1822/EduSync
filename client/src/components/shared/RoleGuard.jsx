import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

const RoleGuard = ({ role }) => {
  const { user } = useSelector((state) => state.auth)

  if (!user || user.role !== role) {
    return <Navigate to="/timetable" replace />
  }

  return <Outlet />
}

export default RoleGuard
