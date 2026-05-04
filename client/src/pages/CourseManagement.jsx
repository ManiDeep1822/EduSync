import { useState } from 'react'
import { useSelector } from 'react-redux'
import { 
  useGetCoursesQuery, 
  useCreateCourseMutation, 
  useUpdateCourseMutation, 
  useDeleteCourseMutation 
} from '../features/courses/coursesApi'
import { useGetTeachersQuery } from '../features/teachers/teachersApi'
import { useGetBatchesQuery } from '../features/batches/batchesApi'
import { BookOpen, Plus, Search, Trash2, Edit, X, Clock, Book, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { clsx } from 'clsx'

const CourseManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: '',
    hoursPerWeek: 4,
    courseType: 'theory',
    requiredRoomType: 'classroom',
    requiredCapacity: 50,
    assignedTeacher: '',
    batches: []
  })

  const { user } = useSelector((state) => state.auth)
  const { data: courses, isLoading, isError } = useGetCoursesQuery()
  const { data: teachers, isLoading: loadingTeachers } = useGetTeachersQuery()
  const { data: batches, isLoading: loadingBatches } = useGetBatchesQuery()
  const [createCourse] = useCreateCourseMutation()
  const [updateCourse] = useUpdateCourseMutation()
  const [deleteCourse] = useDeleteCourseMutation()

  const handleEditClick = (course) => {
    setEditingId(course._id)
    setFormData({
      name: course.name,
      code: course.code,
      department: course.department,
      hoursPerWeek: course.hoursPerWeek,
      courseType: course.courseType,
      requiredRoomType: course.requiredRoomType,
      requiredCapacity: course.requiredCapacity,
      assignedTeacher: course.assignedTeacher?._id || course.assignedTeacher || '',
      batches: course.batches?.map(b => b._id || b) || []
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateCourse({ id: editingId, ...formData }).unwrap()
        toast.success('Course updated successfully')
      } else {
        await createCourse(formData).unwrap()
        toast.success('Course added successfully')
      }
      handleCloseModal()
    } catch (err) {
      toast.error(err.data?.message || `Failed to ${editingId ? 'update' : 'add'} course`)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({ 
      name: '', code: '', department: '', hoursPerWeek: 4, 
      courseType: 'theory', requiredRoomType: 'classroom', 
      requiredCapacity: 50, assignedTeacher: '', batches: [] 
    })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(id).unwrap()
        toast.success('Course deleted')
      } catch (err) {
        toast.error('Delete failed')
      }
    }
  }

  const toggleBatch = (batchId) => {
    setFormData(prev => ({
      ...prev,
      batches: prev.batches.includes(batchId)
        ? prev.batches.filter(id => id !== batchId)
        : [...prev.batches, batchId]
    }))
  }

  if (!user) return null

  if (isLoading || loadingTeachers || loadingBatches) {
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
        <span className="font-bold">Failed to load courses. Please check your permissions.</span>
      </div>
    )
  }

  const filteredCourses = (courses?.data ?? []).filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Course Management</h1>
          <p className="text-slate-500 text-sm md:text-base">Configure curriculum subjects and instructor assignments.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all w-full sm:w-auto font-outfit"
        >
          <Plus size={20} /> New Course
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or course code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px] md:min-w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Course Code & Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Type</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">H/W</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Assigned Teacher</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan="5" className="text-center p-8 text-slate-400">Loading courses...</td></tr>
            ) : filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <tr key={course._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 uppercase tracking-tight">{course.code}</div>
                    <div className="text-sm text-slate-500 font-medium">{course.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                      course.courseType === 'lab' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {course.courseType}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-600 italic">
                    {course.hoursPerWeek}h
                  </td>
                  <td className="px-6 py-4">
                    {course.assignedTeacher ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-primary">
                          {course.assignedTeacher.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{course.assignedTeacher.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-destructive font-bold uppercase italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEditClick(course)}
                        className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(course._id)}
                        className="p-2 text-slate-400 hover:text-destructive transition-colors hover:bg-destructive/5 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="text-center p-8 text-slate-400">No courses defined yet.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">{editingId ? 'Edit Course' : 'New Course Configuration'}</h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Course Code</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none uppercase"
                    placeholder="e.g. CS101"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Course Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="e.g. Data Structures"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Type</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none bg-white font-medium"
                    value={formData.courseType}
                    onChange={e => setFormData({ ...formData, courseType: e.target.value })}
                  >
                    <option value="theory">THEORY</option>
                    <option value="lab">LAB</option>
                    <option value="tutorial">TUTORIAL</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Hours / Week</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                    value={formData.hoursPerWeek}
                    onChange={e => setFormData({ ...formData, hoursPerWeek: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Room Type Req.</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none bg-white font-medium"
                    value={formData.requiredRoomType}
                    onChange={e => setFormData({ ...formData, requiredRoomType: e.target.value })}
                  >
                    <option value="classroom">CLASSROOM</option>
                    <option value="lab">LAB</option>
                    <option value="seminar_hall">SEMINAR HALL</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Assign Instructor</label>
                <select
                  required
                  className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                  value={formData.assignedTeacher}
                  onChange={e => setFormData({ ...formData, assignedTeacher: e.target.value })}
                >
                  <option value="">Select a Teacher...</option>
                  {teachers?.data?.map(t => (
                    <option key={t._id} value={t._id}>{t.name} ({t.department})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 font-bold border-b pb-1 flex w-full">Associated Batches</label>
                <div className="flex flex-wrap gap-2 pt-2">
                  {batches?.data?.map(b => {
                    const isSelected = formData.batches.includes(b._id)
                    return (
                      <button
                        key={b._id}
                        type="button"
                        onClick={() => toggleBatch(b._id)}
                        className={clsx(
                          'px-3 py-1.5 rounded-lg text-xs font-bold transition-all border',
                          isSelected 
                            ? 'bg-primary/10 border-primary text-primary' 
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        )}
                      >
                        {b.name} (Sem {b.semester || 'N/A'})
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  {editingId ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseManagement
