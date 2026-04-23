import { useSelector } from 'react-redux'
import { 
  Users, 
  DoorOpen, 
  BookOpen, 
  Calendar,
  Clock,
  ArrowRight,
  PlusCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useGetTeachersQuery } from '../features/teachers/teachersApi'
import { useGetRoomsQuery } from '../features/rooms/roomsApi'
import { useGetCoursesQuery } from '../features/courses/coursesApi'
import { useGetBatchesQuery } from '../features/batches/batchesApi'
import { useGetTimetablesQuery } from '../features/timetable/timetableApi'

import { Loader2, AlertCircle } from 'lucide-react'

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth)
  
  const isAdmin = user?.role === 'admin'
  
  const { data: teachers, isLoading: loadingTeachers, isError: errorTeachers } = useGetTeachersQuery(undefined, { skip: !isAdmin })
  const { data: rooms, isLoading: loadingRooms, isError: errorRooms } = useGetRoomsQuery(undefined, { skip: !isAdmin })
  const { data: courses, isLoading: loadingCourses, isError: errorCourses } = useGetCoursesQuery(undefined, { skip: !isAdmin })
  const { data: batches, isLoading: loadingBatches, isError: errorBatches } = useGetBatchesQuery(undefined, { skip: !isAdmin })
  const { data: timetables, isLoading: loadingTimetables, isError: errorTimetables } = useGetTimetablesQuery()

  if (!user) return null

  if (loadingTeachers || loadingRooms || loadingCourses || loadingBatches || loadingTimetables) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    )
  }

  if (errorTeachers || errorRooms || errorCourses || errorBatches || errorTimetables) {
    return (
      <div className="flex items-center justify-center block p-8 bg-rose-50 border border-rose-100 rounded-2xl gap-3 text-rose-700">
        <AlertCircle size={24} />
        <span className="font-bold">Something went wrong while loading dashboard data.</span>
      </div>
    )
  }

  const stats = isAdmin ? [
    { label: 'Total Teachers', value: (teachers?.data ?? []).length, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Rooms', value: (rooms?.data ?? []).length, icon: DoorOpen, color: 'bg-emerald-500' },
    { label: 'Total Courses', value: (courses?.data ?? []).length, icon: BookOpen, color: 'bg-amber-500' },
    { label: 'Total Batches', value: (batches?.data ?? []).length, icon: Calendar, color: 'bg-indigo-500' },
  ] : []

  const recentTimetables = (timetables?.data ?? []).slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Welcome back, {user?.name}</h1>
        <p className="text-slate-500 text-sm md:text-base">
          {(user?.role === 'admin') 
            ? "Here's an overview of your institution's schedule status." 
            : "Review your upcoming schedules and academic activities."}
        </p>
      </div>

      {/* Stats Grid */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.color} text-white`}>
                  <stat.icon size={24} />
                </div>
                <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
              </div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Timetables */}
        <div className={isAdmin ? "lg:col-span-2 space-y-4" : "lg:col-span-3 space-y-4"}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              {isAdmin ? "Recent Timetables" : "Published Schedules"}
            </h2>
            <Link to="/timetable" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              {recentTimetables.length > 0 ? (
                <table className="w-full text-left min-w-[500px] md:min-w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">Batch</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">Week</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentTimetables.map((timetable) => (
                      <tr key={timetable._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{timetable.batch?.name}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm">
                          {new Date(timetable.weekStartDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            timetable.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {timetable.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link 
                            to={`/timetable/${timetable._id}`}
                            className="text-primary hover:text-primary/70 font-semibold text-sm"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-slate-500">No schedules available to view at the moment.</p>
                  {isAdmin && (
                    <Link to="/generate" className="mt-4 inline-flex items-center gap-2 text-primary font-bold hover:underline">
                      <PlusCircle size={18} /> Generate your first one
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        {isAdmin && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Shortcuts</h2>
            <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
              <Link to="/generate" className="w-full flex items-center justify-between p-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                Generate Schedule <PlusCircle size={20} />
              </Link>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-tight">Management</p>
                <Link to="/teachers" className="block p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <span className="font-medium text-slate-700">Manage Teachers</span>
                </Link>
                <Link to="/rooms" className="block p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <span className="font-medium text-slate-700">Room Allocation</span>
                </Link>
                <Link to="/courses" className="block p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <span className="font-medium text-slate-700">Course List</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
