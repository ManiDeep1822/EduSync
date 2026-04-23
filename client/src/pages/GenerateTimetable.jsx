import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetBatchesQuery } from '../features/batches/batchesApi'
import { useGenerateTimetableMutation } from '../features/timetable/timetableApi'
import { Calendar, PlusCircle, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

const GenerateTimetable = () => {
  const [batchId, setBatchId] = useState('')
  const [weekStartDate, setWeekStartDate] = useState('')
  const [isGenerated, setIsGenerated] = useState(false)
  
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { data: batches, isLoading: loadingBatches, isError: errorBatches } = useGetBatchesQuery()
  const [generate, { isLoading, data: result }] = useGenerateTimetableMutation()

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!batchId || !weekStartDate) {
      return toast.error('Please select both batch and start date')
    }

    try {
      const response = await generate({ batchId, weekStartDate }).unwrap()
      if (response.success) {
        toast.success('Timetable generated successfully!')
        setIsGenerated(true)
      } else {
        toast.error('Generation completed with issues')
      }
    } catch (err) {
      toast.error(err.data?.message || 'Generation failed')
    }
  }

  if (!user) return null

  if (loadingBatches) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    )
  }

  if (errorBatches) {
    return (
      <div className="flex items-center justify-center p-8 bg-rose-50 border border-rose-100 rounded-2xl gap-3 text-rose-700">
        <AlertCircle size={24} />
        <span className="font-bold">Failed to load batches. Please try again later.</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Generate New Timetable</h1>
        <p className="text-slate-500 text-sm md:text-base">Run the EduSync engine to create an optimized, conflict-free schedule.</p>
      </div>

      <div className="bg-white border rounded-2xl p-8 shadow-sm">
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Select Batch</label>
            <select
              required
              className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none bg-slate-50 font-medium"
              value={batchId}
              onChange={e => setBatchId(e.target.value)}
            >
              <option value="">Choose a Batch...</option>
              {(batches?.data ?? []).map(b => (
                <option key={b._id} value={b._id}>{b.name} ({b.department})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Week Start Date</label>
            <input
              type="date"
              required
              className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none bg-slate-50 font-medium"
              value={weekStartDate}
              onChange={e => setWeekStartDate(e.target.value)}
            />
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Running EduSync Algorithm...
                </>
              ) : (
                <>
                  <PlusCircle size={24} />
                  Generate Timetable
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {isLoading && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4 animate-pulse">
          <div className="p-2 bg-blue-100 rounded-full h-fit text-blue-600">
            <Loader2 className="animate-spin" size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-blue-900">Scheduling Engine Active</h3>
            <p className="text-blue-700 text-sm">Processing constraints: Checking teacher availability, room capacities, and course requirements...</p>
          </div>
        </div>
      )}

      {isGenerated && result?.data && (
        <div className="bg-white border rounded-2xl p-8 shadow-md border-emerald-100 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-4 text-emerald-600">
            <CheckCircle2 size={32} />
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Generation Complete!</h2>
              <p className="text-slate-500 font-medium italic">Timetable saved as Draft</p>
            </div>
          </div>

          {result.data.conflicts.length > 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-bold uppercase tracking-wider text-xs">
                <AlertCircle size={16} /> {result.data.conflicts.length} Optimization Conflicts Detected
              </div>
              <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
                {result.data.conflicts.map((c, i) => (
                  <li key={i}>{c.description}</li>
                ))}
              </ul>
              <p className="text-[10px] text-amber-600 font-medium pt-1 italic">
                The algorithm prioritized hard constraints. You may need to manually adjust these slots in the grid.
              </p>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-emerald-800 text-sm font-medium">
              Perfect! No conflicts were detected in this week's schedule.
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate(`/timetable/${result.data._id}`)}
              className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              View Grid & Edit
            </button>
            <button
              onClick={() => setIsGenerated(false)}
              className="flex-1 border bg-white py-3 rounded-xl font-bold hover:bg-slate-50 transition-all"
            >
              Generate for Another Batch
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GenerateTimetable
