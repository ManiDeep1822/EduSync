import { useMemo } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TimetableCell from './TimetableCell'
import { useUpdateSlotMutation } from '../../features/timetable/timetableApi'
import { toast } from 'sonner'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const TIMES = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']

const TimetableGrid = ({ timetable, isAdmin }) => {
  const [updateSlot] = useUpdateSlotMutation()

  // Build a 2D lookup for slots [day][time]
  const slotMap = useMemo(() => {
    const map = {}
    DAYS.forEach(d => {
      map[d] = {}
      TIMES.forEach(t => { map[d][t] = null })
    })

    timetable?.slots?.forEach((slot, index) => {
      if (map[slot.day]) {
        map[slot.day][slot.startTime] = { ...slot, originalIndex: index }
      }
    })
    return map
  }, [timetable])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event) => {
    if (!isAdmin || timetable?.status !== 'draft') return;
    const { active, over } = event
    
    if (!over || active.id === over.id) return

    const activeSlot = active.data.current
    const overIdParts = over.id.split('-') // day-time
    const newDay = overIdParts[0]
    const newStartTime = overIdParts[1]

    const newEndTimeHour = parseInt(newStartTime.split(':')[0]) + 1
    const newEndTime = `${newEndTimeHour.toString().padStart(2, '0')}:00`

    try {
      await updateSlot({
        id: timetable._id,
        slotIndex: activeSlot.originalIndex,
        updatedSlot: {
          day: newDay,
          startTime: newStartTime,
          endTime: newEndTime
        }
      }).unwrap()
      toast.success('Slot moved successfully')
    } catch (err) {
      toast.error('Failed to move slot. Constraint violated?')
    }
  }

  const renderTable = () => (
    <div className="w-full overflow-x-auto print:overflow-visible">
      <table className="w-full min-w-[1000px] print:min-w-full border-collapse bg-white print:text-xs">
        <thead className="sticky top-0 z-20 print:static">
          <tr>
            <th className="p-4 bg-slate-50 border-b border-r sticky left-0 z-30 w-24 print:static print:w-auto"></th>
            {DAYS.map(day => (
              <th key={day} className="p-4 bg-slate-50 border-b text-sm font-bold text-slate-900 uppercase tracking-widest text-center border-r print:text-[10px] print:p-2">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIMES.map(time => (
            <tr key={time}>
              <td className="p-4 bg-slate-50 border-b border-r sticky left-0 z-10 text-xs font-bold text-slate-500 text-center print:static print:p-2">
                {time}
              </td>
              {time === '13:00' ? (
                <td colSpan={DAYS.length} className="bg-slate-50 border-b text-center py-6">
                  <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-slate-100/80 text-slate-400 font-bold uppercase tracking-[0.3em] text-xs shadow-inner">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    Lunch Break
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  </div>
                </td>
              ) : (
                DAYS.map(day => {
                  const slot = slotMap[day][time]
                  return (
                    <TimetableCell
                      key={`${day}-${time}`}
                      id={`${day}-${time}`}
                      slot={slot}
                      isAdmin={isAdmin && timetable?.status === 'draft'}
                      day={day}
                      time={time}
                    />
                  )
                })
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return isAdmin ? (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {renderTable()}
    </DndContext>
  ) : renderTable()
}

export default TimetableGrid
