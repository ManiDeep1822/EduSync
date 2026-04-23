import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  DoorOpen, 
  BookOpen, 
  CalendarPlus,
  LayoutGrid
} from 'lucide-react'
import { clsx } from 'clsx'

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useSelector((state) => state.auth)
  const isAdmin = user?.role === 'admin'

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/timetable', label: 'Timetable', icon: Calendar },
  ]

  if (isAdmin) {
    links.splice(1, 0,
      { to: '/generate', label: 'Generate Timetable', icon: CalendarPlus },
      { to: '/teachers', label: 'Teachers', icon: Users },
      { to: '/rooms', label: 'Rooms', icon: DoorOpen },
      { to: '/courses', label: 'Courses', icon: BookOpen },
      { to: '/batches', label: 'Batches', icon: LayoutGrid },
    )
  }

  return (
    <aside className={clsx(
      "fixed md:relative top-20 md:top-0 inset-y-0 left-0 z-30 w-64 border-r bg-white h-[calc(100vh-80px)] overflow-y-auto p-4 flex flex-col gap-2 transition-transform duration-300 ease-in-out md:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => {
              if (window.innerWidth < 768) onClose();
            }}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium',
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )
            }
          >
            <link.icon size={20} />
            {link.label}
          </NavLink>
        ))}
      </div>
    </aside>
  )
}

export default Sidebar
