import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { 
  useGetBatchesQuery, 
  useCreateBatchMutation, 
  useUpdateBatchMutation, 
  useDeleteBatchMutation 
} from '../features/batches/batchesApi'
import { Calendar, Plus, Search, Trash2, Edit, X, Users, GraduationCap, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

const BatchManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    semester: 1,
    studentCount: 50
  })

  const { user } = useSelector((state) => state.auth)
  const { data: batches, isLoading, isError } = useGetBatchesQuery()
  const [createBatch] = useCreateBatchMutation()
  const [updateBatch] = useUpdateBatchMutation()
  const [deleteBatch] = useDeleteBatchMutation()

  const handleEditClick = (batch) => {
    setEditingId(batch._id)
    setFormData({
      name: batch.name,
      department: batch.department,
      semester: batch.semester,
      studentCount: batch.studentCount
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateBatch({ id: editingId, ...formData }).unwrap()
        toast.success('Batch updated successfully')
      } else {
        await createBatch(formData).unwrap()
        toast.success('Batch created successfully')
      }
      handleCloseModal()
    } catch (err) {
      toast.error(err.data?.message || `Failed to ${editingId ? 'update' : 'create'} batch`)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({ name: '', department: '', semester: 1, studentCount: 50 })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      try {
        await deleteBatch(id).unwrap()
        toast.success('Batch deleted')
      } catch (err) {
        toast.error('Delete failed')
      }
    }
  }

  if (!user) return null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8 bg-rose-50 border border-rose-100 rounded-2xl gap-3 text-rose-700">
        <AlertCircle size={24} />
        <span className="font-bold">Failed to load batches. Please check your permissions.</span>
      </div>
    )
  }

  const filteredBatches = (batches?.data ?? []).filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Batch Management</h1>
          <p className="text-slate-500">Organize students into class groups and semesters.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          <Plus size={20} /> Add Batch
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search batches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-slate-400">Loading batches...</div>
        ) : filteredBatches.length > 0 ? (
          filteredBatches.map((batch) => (
            <div key={batch._id} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{batch.name}</h3>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{batch.department}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Semester</span>
                  <span className="text-lg font-black text-slate-700">{batch.semester}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Students</span>
                  <div className="flex items-center gap-1.5 font-black text-slate-700">
                    <Users size={16} /> {batch.studentCount}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t">
                <Link to={`/timetable/batch/${batch._id}`} className="text-xs font-bold text-primary hover:underline uppercase tracking-tight">
                  View Timetable
                </Link>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEditClick(batch)}
                    className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(batch._id)}
                    className="p-2 text-slate-400 hover:text-destructive transition-colors hover:bg-destructive/5 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center bg-white border border-dashed rounded-3xl">
            <p className="text-slate-400 font-medium">No batches created yet. Organize your students first.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">{editingId ? 'Edit Batch' : 'Add New Batch'}</h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Batch Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="e.g. CS-2024-A"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Department</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="e.g. Information Technology"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Semester</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                    value={formData.semester}
                    onChange={e => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Student Count</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                    value={formData.studentCount}
                    onChange={e => setFormData({ ...formData, studentCount: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all mt-4"
              >
                {editingId ? 'Update Batch' : 'Create Batch'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BatchManagement
