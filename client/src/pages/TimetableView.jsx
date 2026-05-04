import { useState, useEffect, useMemo } from 'react'
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
import { toast } from 'sonner'

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
  const rawData = timetableData?.data || batchData?.data || teacherData?.data
  
  // Handle Teacher role returning an array of timetables
  const timetable = useMemo(() => {
    if (Array.isArray(rawData)) {
      if (rawData.length === 0) return null
      // Merge all slots from multiple timetables into one virtual timetable for the teacher
      return {
        _id: 'teacher-virtual',
        status: 'published',
        batch: { name: 'Your Schedule' },
        slots: rawData.flatMap(t => t.slots.map(s => ({ ...s, batch: t.batch })))
      }
    }
    return rawData
  }, [rawData])

  // Refined Error Logic
  const isError = (id && isErrorById) || (!id && !timetable && !isLoading && !isAdmin && (activeBatchId || user?.role === 'teacher'))
  const isBatchMissing = user?.role === 'student' && !user?.batchId
  const isBaseRoute = !id && !paramBatchId

  const { data: batches } = useGetBatchesQuery(undefined, {
    skip: !isAdmin
  })
  const [publish, { isLoading: isPublishing }] = usePublishTimetableMutation()

  // Final filtering/processing of the timetable slots
  const filteredTimetable = useMemo(() => {
    if (!timetable) return null
    // Only filter for the teacher if we are in the 'Virtual' view (aggregated schedule)
    // If we are viewing a specific batch (id is present), show everything for context
    const shouldFilter = user?.role === 'teacher' && timetable._id === 'teacher-virtual'
    
    return {
      ...timetable,
      slots: shouldFilter 
        ? (timetable.slots ?? []).filter(slot => {
            const slotTeacherId = typeof slot.teacher === 'object' ? slot.teacher._id : slot.teacher
            return slotTeacherId === user.teacherId
          })
        : (timetable.slots ?? [])
    }
  }, [timetable, user])

  useEffect(() => {
    if (socket && timetable && timetable.batch) {
      const roomId = `batch-${timetable.batch._id || timetable.batch}`
      socket.emit('join', roomId)
      
      // Cleanup: Leave room when unmounting or changing timetable
      return () => {
        socket.emit('leave', roomId)
      }
    }
  }, [socket, timetable])

  // Student check: Redirect if trying to view wrong batch
  useEffect(() => {
    if (user?.role === 'student' && timetable && timetable.batch?._id !== user.batchId) {
      toast.error('You are not authorized to view this batch timetable')
    }
  }, [user, timetable])

  const handlePrint = () => {
    window.print()
  }

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

  if (isBatchMissing) {
    return (
      <div className="flex items-center justify-center p-8 bg-amber-50 border border-amber-100 rounded-2xl gap-3 text-amber-700">
        <AlertCircle size={24} />
        <div className="flex flex-col">
          <span className="font-bold text-sm">No Batch Assigned</span>
          <p className="text-xs opacity-80">Please contact the administrator to assign you to a batch.</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-20 space-y-6">
        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mx-auto border border-rose-100">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">No Timetable Found</h2>
          <p className="text-slate-500 max-w-sm mx-auto">
            {user?.role === 'student' 
              ? "Your batch doesn't have a published timetable for this week yet. Please check back later."
              : "We couldn't find the timetable you're looking for. It might have been deleted or moved."
            }
          </p>
        </div>
        <Link to="/dashboard" className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  if ((!timetable && isBaseRoute) || (isAdmin && !id && !paramBatchId)) return (
    <div className="text-center py-20 space-y-4">
      <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mx-auto">
        <Calendar size={40} />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">
        {user.role === 'admin' ? 'Manage Timetables' : 'Select a Timetable'}
      </h2>
      <p className="text-slate-500 max-w-sm mx-auto">
        {user.role === 'admin' 
          ? 'Please go to the dashboard to select a batch or generate a new weekly schedule.'
          : 'Please choose a timetable from the dashboard to view your weekly schedule.'
        }
      </p>
      <Link to="/dashboard" className="inline-block bg-primary text-white px-6 py-2 rounded-xl font-bold">
        Go to Dashboard
      </Link>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors no-print">
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
              Weekly Schedule: <span className="text-primary">{timetable?.batch ? `${timetable.batch.name} (Sem ${timetable.batch.semester || '?'})` : 'Loading...'}</span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:gap-6 text-sm font-medium pl-9">
            <span className="text-slate-500 flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
              <Calendar size={14} className="text-slate-400" /> {timetable?.weekStartDate ? new Date(timetable.weekStartDate).toLocaleDateString() : 'N/A'}
            </span>
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
              timetable?.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {timetable?.status === 'published' ? <Lock size={14} /> : <Unlock size={14} />}
              {(timetable?.status || 'UNKNOWN').toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border rounded-xl overflow-hidden shadow-sm no-print">
            <button 
              onClick={handlePrint}
              className="p-2.5 hover:bg-slate-50 transition-colors border-r" 
              title="Print"
            >
              <Printer size={20} className="text-slate-600" />
            </button>
            <button 
              onClick={handlePrint}
              className="p-2.5 hover:bg-slate-50 transition-colors" 
              title="Download PDF"
            >
              <FileText size={20} className="text-slate-600" />
            </button>
          </div>
          
          {isAdmin && timetable?.status === 'draft' && (
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 no-print"
            >
              <Share2 size={20} /> {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          )}
        </div>
      </div>

      {isAdmin && <ConflictBadge conflicts={timetable?.conflicts ?? []} />}

      <div className="bg-white border rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden print:overflow-visible print:shadow-none print:border-none print:rounded-none">
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
