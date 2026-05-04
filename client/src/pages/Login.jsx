import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useLoginMutation } from '../features/auth/authApi'
import { setCredentials } from '../features/auth/authSlice'
import { toast } from 'sonner'
import { LogIn, Calendar, Lock, Mail, Loader2, Eye, EyeOff, ShieldCheck, UserCog, GraduationCap } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const [showPassword, setShowPassword] = useState(false)
  
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [login, { isLoading }] = useLoginMutation()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const loginPromise = login({ email, password }).unwrap()
    
    toast.promise(loginPromise, {
      loading: 'Authenticating...',
      success: (data) => {
        dispatch(setCredentials(data))
        return `Welcome back, ${data.user.name}!`
      },
      error: (err) => err.data?.message || 'Login failed'
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/10 overflow-hidden border">
            <img src="/logo.png" alt="EduSync Logo" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">EduSync</h1>
          <p className="text-slate-500 mt-2 text-center">Smart Academic Scheduler for Educational Institutions</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Mail size={16} /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50/50"
              placeholder="admin@edu.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Lock size={16} /> Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50/50 pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
            Sign In to Dashboard
          </button>
        </form>

        <div className="mt-8 pt-6 border-t">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-4">Quick Login for Demo</p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => { setEmail('admin@edu.com'); setPassword('password123'); }}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                <ShieldCheck size={20} />
              </div>
              <span className="text-xs font-bold text-slate-600">Admin</span>
            </button>
            <button
              onClick={() => { 
                const rand = Math.floor(Math.random() * 15) + 1;
                setEmail(`teacher${rand}@edu.com`); 
                setPassword('password123'); 
              }}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                <UserCog size={20} />
              </div>
              <span className="text-xs font-bold text-slate-600">Teacher</span>
            </button>
            <button
              onClick={() => { 
                const rand = Math.floor(Math.random() * 20) + 1;
                setEmail(`student${rand}@edu.com`); 
                setPassword('password123'); 
              }}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                <GraduationCap size={20} />
              </div>
              <span className="text-xs font-bold text-slate-600">Student</span>
            </button>
          </div>
          <p className="mt-6 text-sm text-slate-500 text-center">
            Forgot your password? Please contact your institution's administrator.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
