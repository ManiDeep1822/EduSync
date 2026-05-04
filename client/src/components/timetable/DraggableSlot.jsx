import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { User, MapPin, AlertTriangle } from 'lucide-react'
import { clsx } from 'clsx'

const DraggableSlot = ({ slot, isAdmin }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `slot-${slot.originalIndex}`,
    data: slot,
    disabled: !isAdmin
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : 1,
  }

  const courseType = slot.course?.courseType || 'theory'
  
  const colors = {
    theory: 'bg-blue-50 border-blue-200 text-blue-700 shadow-blue-50',
    lab: 'bg-purple-50 border-purple-200 text-purple-700 shadow-purple-50',
    tutorial: 'bg-amber-50 border-amber-200 text-amber-700 shadow-amber-50'
  }

  const badgeColors = {
    theory: 'bg-blue-500',
    lab: 'bg-purple-500',
    tutorial: 'bg-amber-500'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isAdmin ? listeners : {})}
      {...(isAdmin ? attributes : {})}
      className={clsx(
        'w-full h-full rounded-xl border p-3 flex flex-col justify-between transition-all select-none',
        colors[courseType] || colors.theory,
        isDragging ? 'shadow-2xl opacity-100 scale-95 ring-2 ring-primary cursor-grabbing' : 'shadow-sm',
        isAdmin ? 'cursor-grab hover:shadow-md' : ''
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] uppercase font-bold tracking-widest truncate">
            {slot.course?.code || 'UNKN'}
          </span>
          <div className={clsx('w-2 h-2 rounded-full', badgeColors[courseType])}></div>
        </div>
        <h5 className="text-xs font-black line-clamp-2 leading-tight uppercase">
          {slot.course?.name || 'Unknown Course'}
        </h5>
      </div>

      <div className="space-y-1 mt-2 border-t pt-2 border-current/10">
        <div className="flex items-center gap-1.5 text-[10px] font-bold">
          <User size={12} strokeWidth={3} />
          <span className="truncate">{slot.teacher?.name || 'TBA'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold">
          <MapPin size={12} strokeWidth={3} />
          <span className="truncate">
            {slot.room?.name || '---'} {slot.room?.block ? `(Block ${slot.room.block})` : ''}
          </span>
        </div>
      </div>
      
      {/* Conflict indicator could go here if detected locally */}
    </div>
  )
}

export default DraggableSlot
