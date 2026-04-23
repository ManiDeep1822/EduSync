import { AlertCircle } from 'lucide-react'

const ConflictBadge = ({ conflicts = [] }) => {
  if (conflicts.length === 0) return null;

  return (
    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3">
      <AlertCircle className="text-rose-600 shrink-0" size={24} />
      <div className="space-y-1">
        <h4 className="font-bold text-rose-900 text-sm">Action Required: Conflicts Detected</h4>
        <p className="text-rose-700 text-xs">
          This timetable has {conflicts.length} unresolved scheduling conflicts. 
          Draft schedules must be resolved before publication.
        </p>
      </div>
    </div>
  )
}

export default ConflictBadge
