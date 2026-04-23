import { useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../features/auth/authSlice'
import { useLogoutMutation } from '../../features/auth/authApi'
import { Menu, LogOut, User, Calendar, LayoutDashboard } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { clsx } from 'clsx'

const Navbar = ({ onMenuClick, className }) => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [logoutApi] = useLogoutMutation()

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap()
      dispatch(logout())
      navigate('/login')
      toast.success('Logged out successfully')
    } catch (err) {
      toast.error('Logout failed')
    }
  }

  return (
    <nav className={clsx("h-16 border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-4 md:px-6", className)}>
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-secondary rounded-lg md:hidden transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu size={24} className="text-muted-foreground" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 overflow-hidden rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <img src="/logo.png" alt="EduSync Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
            EduSync
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-2 px-2 py-1 md:px-3 md:py-1.5 bg-secondary rounded-full">
          <User size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
          <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
            {user?.role}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  )
}

export default Navbar
