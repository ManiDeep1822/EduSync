import { useState } from 'react'
import { useSelector } from 'react-redux'
import { 
  useGetRoomsQuery, 
  useCreateRoomMutation, 
  useUpdateRoomMutation, 
  useDeleteRoomMutation 
} from '../features/rooms/roomsApi'
import { DoorOpen, Plus, Search, Trash2, Edit, X, Hash, Laptop, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { clsx } from 'clsx'

const RoomManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    capacity: 30,
    type: 'classroom',
    block: '1',
    facilities: []
  })

  const { user } = useSelector((state) => state.auth)
  const { data: rooms, isLoading, isError } = useGetRoomsQuery()
  const [createRoom] = useCreateRoomMutation()
  const [updateRoom] = useUpdateRoomMutation()
  const [deleteRoom] = useDeleteRoomMutation()

  const roomTypes = ['classroom', 'lab', 'seminar_hall']
  const facilityOptions = ['projector', 'AC', 'computers', 'whiteboard', 'audio_system']

  const handleEditClick = (room) => {
    setEditingId(room._id)
    setFormData({
      name: room.name,
      capacity: room.capacity,
      type: room.type,
      block: room.block || '1',
      facilities: room.facilities || []
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateRoom({ id: editingId, ...formData }).unwrap()
        toast.success('Room updated successfully')
      } else {
        await createRoom(formData).unwrap()
        toast.success('Room created successfully')
      }
      handleCloseModal()
    } catch (err) {
      toast.error(err.data?.message || `Failed to ${editingId ? 'update' : 'create'} room`)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({ name: '', capacity: 30, type: 'classroom', block: '1', facilities: [] })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await deleteRoom(id).unwrap()
        toast.success('Room deleted')
      } catch (err) {
        toast.error('Delete failed')
      }
    }
  }

  const toggleFacility = (facility) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }))
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
        <span className="font-bold">Failed to load rooms. Please check your permissions.</span>
      </div>
    )
  }

  const filteredRooms = (rooms?.data ?? []).filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.block && r.block.toString().includes(searchTerm))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Room Management</h1>
          <p className="text-slate-500 text-sm md:text-base">Define classrooms, labs, and their facilities.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all w-full sm:w-auto"
        >
          <Plus size={20} /> Add Room
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search rooms or blocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-slate-400">Loading rooms...</div>
        ) : filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
            <div key={room._id} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-primary">
                    {room.type === 'lab' ? <Laptop size={24} /> : <DoorOpen size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg uppercase truncate max-w-[120px]">{room.name}</h3>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded w-fit">
                        {room.type.replace('_', ' ')}
                      </span>
                      {room.block && (
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">
                          Block {room.block}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-slate-600 font-bold">
                    <Hash size={16} /> {room.capacity}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">CAPACITY</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {room.facilities.map(f => (
                    <span key={f} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border capitalize">
                      {f.replace('_', ' ')}
                    </span>
                  ))}
                  {room.facilities.length === 0 && (
                    <span className="text-[10px] font-medium text-slate-300 italic">No facilities listed</span>
                  )}
                </div>
                
                <div className="pt-4 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEditClick(room)}
                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(room._id)}
                    className="p-2 text-slate-400 hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center bg-white border border-dashed rounded-3xl">
            <p className="text-slate-400">No rooms found matching your criteria.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">{editingId ? 'Edit Room' : 'Add New Room'}</h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Room Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="e.g. Room 402"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Block</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                      placeholder="1-15"
                      value={formData.block}
                      onChange={e => setFormData({ ...formData, block: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Type</label>
                    <select
                      className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none bg-white font-medium"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                    >
                      {roomTypes.map(t => (
                        <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Capacity</label>
                    <input
                      type="number"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none"
                      value={formData.capacity}
                      onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 font-bold border-b pb-1 flex w-full">Facilities</label>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {facilityOptions.map(f => {
                      const isSelected = formData.facilities.includes(f)
                      return (
                        <button
                          key={f}
                          type="button"
                          onClick={() => toggleFacility(f)}
                          className={clsx(
                            'px-3 py-1.5 rounded-lg text-xs font-bold transition-all border',
                            isSelected 
                              ? 'bg-primary/10 border-primary text-primary' 
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          )}
                        >
                          {f.replace('_', ' ').toUpperCase()}
                        </button>
                      )
                    })}
                  </div>
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
                  {editingId ? 'Update Room' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoomManagement
