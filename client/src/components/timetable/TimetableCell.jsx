import { useDroppable } from '@dnd-kit/core'
import DraggableSlot from './DraggableSlot'
import { clsx } from 'clsx'

const TimetableCell = ({ id, slot, isAdmin, day, time }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { day, time }
  })

  return (
    <td
      ref={setNodeRef}
      className={clsx(
        'p-1 border-b border-r min-h-[100px] h-32 transition-colors relative group',
        isOver && 'bg-primary/10 border-primary border-2 z-10'
      )}
    >
      {slot ? (
        <DraggableSlot slot={slot} isAdmin={isAdmin} />
      ) : (
        <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-40 select-none">
          <span className="text-[10px] font-bold text-slate-300">FREE</span>
        </div>
      )}
    </td>
  )
}

export default TimetableCell
