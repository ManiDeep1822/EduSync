import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  useGetTimetableByIdQuery, 
  usePublishTimetableMutation,
  useUpdateSlotMutation,
  useGetLatestByBatchQuery,
  useGetForTeacherQuery
} from '../features/timetable/timetableApi'
import { useGetBatchesQuery } from '../features/batches/batchesApi'
import { useSelector } from 'react-redux'
import useSocket from '../hooks/useSocket'
import TimetableGrid from '../components/timetable/TimetableGrid'
import ConflictBadge from '../components/shared/ConflictBadge'
import { 
  Calendar, 
  ChevronLeft, 
  Share2, 
  FileText, 
  AlertCircle, 
  Loader2,
  Lock,
  Unlock,
  Printer
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const TimetableView = () => {
  const { id, batchId: paramBatchId } = useParams()
  const socket = useSocket()
  const { user } = useSelector((state) => state.auth)
  const isAdmin = user?.role === 'admin'
  const activeBatchId = paramBatchId ?? user?.batchId

  // Primary fetch: by ID
  const { data: timetableData, isLoading: isLoadingById, isError: isErrorById } = useGetTimetableByIdQuery(id, {
    skip: !id
  })

  // Secondary fetch for Students: by BatchId
  const { data: batchData, isLoading: isLoadingBatch } = useGetLatestByBatchQuery(activeBatchId, {
    skip: !!id || (!activeBatchId)
  })

  // Secondary fetch for Teachers: by TeacherId
  const { data: teacherData, isLoading: isLoadingTeacher } = useGetForTeacherQuery(user?.teacherId, {
    skip: !!id || !!paramBatchId || user?.role !== 'teacher'
  })

  const isLoading = isLoadingById || isLoadingBatch || isLoadingTeacher
  const timetable = timetableData?.data || batchData?.data || teacherData?.data
  const isError = (id && isErrorById) || (!id && !timetable && !isLoading && !isAdmin)

  const { data: batches } = useGetBatchesQuery(undefined, {
    skip: !isAdmin
  })
  const [publish, { isLoading: isPublishing }] = usePublishTimetableMutation()

  // Filtering logic for Teacher role
  const filteredTimetable = timetable ? {
    ...timetable,
    slots: user?.role === 'teacher' 
      ? (timetable.slots ?? []).filter(slot => slot.teacher?._id === user.teacherId)
      : (timetable.slots ?? [])
  } : null

  useEffect(() => {
    if (socket && timetable) {
      socket.emit('join', `batch-${timetable.batch?._id}`)
    }
  }, [socket, timetable])

  // Student check: Redirect if trying to view wrong batch
  useEffect(() => {
    if (user?.role === 'student' && timetable && timetable.batch?._id !== user.batchId) {
      toast.error('You are not authorized to view this batch timetable')
    }
  }, [user, timetable])

  const handlePublish = async () => {
    try {
      await publish(id).unwrap()
      toast.success('Timetable published to all students and teachers!')
    } catch (err) {
      toast.error('Failed to publish')
    }
  }

  if (!user) return null

  if (isLoading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-primary" size={48} />
      <p className="text-slate-500 font-medium">Loading Timetable Grid...</p>
    </div>
  )

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8 bg-rose-50 border border-rose-100 rounded-2xl gap-3 text-rose-700">
        <AlertCircle size={24} />
        <span className="font-bold text-sm">Timetable not found or access denied.</span>
      </div>
    )
  }

  if (!timetable && !id) return (
    <div className="text-center py-20 space-y-4">
      <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mx-auto">
        <Calendar size={40} />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">Select a Timetable</h2>
      <p className="text-slate-500 max-w-sm mx-auto">Please choose a timetable from the dashboard or generate a new one to view the weekly schedule.</p>
      <Link to="/dashboard" className="inline-block bg-primary text-white px-6 py-2 rounded-xl font-bold">
        Go to Dashboard
      </Link>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/dashboard" className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">
              Weekly Schedule: {timetable?.batch?.name || 'Loading...'}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="text-slate-500 flex items-center gap-1">
              <Calendar size={14} /> Week of {timetable?.weekStartDate ? new Date(timetable.weekStartDate).toLocaleDateString() : 'N/A'}
            </span>
            <span className={`flex items-center gap-1 ${
              timetable?.status === 'published' ? 'text-emerald-600' : 'text-amber-600'
            }`}>
              {timetable?.status === 'published' ? <Lock size={14} /> : <Unlock size={14} />}
              {(timetable?.status || 'UNKNOWN').toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-white border rounded-xl hover:bg-slate-50 transition-colors shadow-sm" title="Print">
            <Printer size={20} className="text-slate-600" />
          </button>
          <button className="p-2.5 bg-white border rounded-xl hover:bg-slate-50 transition-colors shadow-sm" title="Download PDF">
            <FileText size={20} className="text-slate-600" />
          </button>
          
          {isAdmin && timetable?.status === 'draft' && (
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
            >
              <Share2 size={20} /> {isPublishing ? 'Publishing...' : 'Publish Schedule'}
            </button>
          )}
        </div>
      </div>

      {isAdmin && <ConflictBadge conflicts={timetable?.conflicts ?? []} />}

      <div className="bg-white border rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden">
        <TimetableGrid timetable={filteredTimetable} isAdmin={isAdmin} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border rounded-2xl shadow-sm">
          <h4 className="font-bold text-slate-900 mb-2">Legend</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div> Theory Class
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div> Lab Session
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div> Tutorial
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimetableView
