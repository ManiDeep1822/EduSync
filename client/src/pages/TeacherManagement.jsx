import { useState } from 'react'
import { useSelector } from 'react-redux'
import { 
  useGetTeachersQuery, 
  useCreateTeacherMutation, 
  useUpdateTeacherMutation, 
  useDeleteTeacherMutation 
} from '../features/teachers/teachersApi'
import { 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Clock,
  ChevronDown,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { clsx } from 'clsx'
import { toast } from 'react-hot-toast'

const TeacherManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    maxHoursPerWeek: 20,
    availability: [
      { day: 'Monday', slots: [] },
      { day: 'Tuesday', slots: [] },
      { day: 'Wednesday', slots: [] },
      { day: 'Thursday', slots: [] },
      { day: 'Friday', slots: [] },
      { day: 'Saturday', slots: [] },
    ]
  })

  const { user } = useSelector((state) => state.auth)
  const { data: teachers, isLoading, isError } = useGetTeachersQuery()
  const [createTeacher] = useCreateTeacherMutation()
  const [updateTeacher] = useUpdateTeacherMutation()
  const [deleteTeacher] = useDeleteTeacherMutation()

  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const handleEditClick = (teacher) => {
    setEditingId(teacher._id)
    setFormData({
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
      maxHoursPerWeek: teacher.maxHoursPerWeek,
      availability: teacher.availability || days.map(day => ({ day, slots: [] }))
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateTeacher({ id: editingId, ...formData }).unwrap()
        toast.success('Teacher updated successfully')
      } else {
        await createTeacher(formData).unwrap()
        toast.success('Teacher added successfully')
      }
      handleCloseModal()
    } catch (err) {
      toast.error(err.data?.message || `Failed to ${editingId ? 'update' : 'add'} teacher`)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({
      name: '', email: '', department: '', maxHoursPerWeek: 20,
      availability: days.map(day => ({ day, slots: [] }))
    })
  }

  const toggleSlot = (day, slot) => {
    setFormData(prev => {
      const newAvailability = prev.availability.map(a => {
        if (a.day === day) {
          const newSlots = a.slots.includes(slot)
            ? a.slots.filter(s => s !== slot)
            : [...a.slots, slot]
          return { ...a, slots: newSlots }
        }
        return a
      })
      return { ...prev, availability: newAvailability }
    })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await createTeacher(formData).unwrap()
      toast.success('Teacher added successfully')
      setIsModalOpen(false)
      setFormData({
        name: '', email: '', department: '', maxHoursPerWeek: 20,
        availability: days.map(day => ({ day, slots: [] }))
      })
    } catch (err) {
      toast.error(err.data?.message || 'Failed to add teacher')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await deleteTeacher(id).unwrap()
        toast.success('Teacher deleted')
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
        <span className="font-bold">Failed to load teachers. Please check your permissions.</span>
      </div>
    )
  }

  const filteredTeachers = (teachers?.data ?? []).filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Teacher Management</h1>
          <p className="text-slate-500">Add and manage teaching staff availability.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
        >
          <Plus size={20} /> Add Teacher
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Name & Department</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Availability</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Max Hours</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan="4" className="text-center p-8 text-slate-400">Loading...</td></tr>
            ) : filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <tr key={teacher._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{teacher.name}</div>
                    <div className="text-sm text-slate-500">{teacher.department}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {teacher.availability.map(a => a.slots.length > 0 && (
                        <span key={a.day} className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded border font-medium">
                          {a.day.substring(0, 3)} ({a.slots.length})
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">{teacher.maxHoursPerWeek}h / week</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEditClick(teacher)}
                        className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(teacher._id)}
                        className="p-2 text-slate-400 hover:text-destructive transition-colors hover:bg-destructive/5 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="text-center p-8 text-slate-400">No teachers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">{editingId ? 'Edit Teacher' : 'Add New Teacher'}</h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="e.g. Dr. Jane Doe"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="email@edusync.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Department</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="e.g. Computer Science"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold border-b pb-2">
                  <Clock size={20} className="text-primary" />
                  Availability (Select Available Slots)
                </div>
                <div className="overflow-x-auto border rounded-xl bg-slate-50/30">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="p-3 text-xs font-bold text-slate-500 uppercase border-r bg-white">Day / Time</th>
                        {timeSlots.map(time => (
                          <th key={time} className="p-3 text-xs font-bold text-slate-500 uppercase">{time}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {days.map(day => (
                        <tr key={day} className="border-t">
                          <td className="p-3 text-sm font-bold text-slate-700 bg-white border-r">{day}</td>
                          {timeSlots.map(time => {
                            const isSelected = formData.availability.find(a => a.day === day)?.slots.includes(time)
                            return (
                              <td key={`${day}-${time}`} className="p-1">
                                <button
                                  type="button"
                                  onClick={() => toggleSlot(day, time)}
                                  className={clsx(
                                    'w-full h-10 rounded-lg border transition-all flex items-center justify-center font-bold text-[10px]',
                                    isSelected 
                                      ? 'bg-primary border-primary text-white shadow-sm shadow-primary/20' 
                                      : 'bg-white border-slate-100 text-transparent hover:border-primary/30 hover:bg-primary/5'
                                  )}
                                >
                                  {isSelected ? 'AVAILABLE' : ''}
                                </button>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white z-10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  {editingId ? 'Update Teacher' : 'Save Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherManagement
