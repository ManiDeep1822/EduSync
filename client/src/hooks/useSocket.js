import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { io } from 'socket.io-client'
import { timetableApi } from '../features/timetable/timetableApi'
import { toast } from 'react-hot-toast'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

const useSocket = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const socketRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated || !user) return

    try {
      // Connect
      socketRef.current = io(SOCKET_URL, {
        withCredentials: true,
      })

      const socket = socketRef.current

      socket.on('connect', () => {
        try {
          console.log('Socket connected:', socket.id)
          
          // Join proper rooms
          if (user.role === 'admin') {
            socket.emit('join', 'admin-room')
          }
        } catch (err) {
          console.error('Socket connect error:', err)
        }
      })

      // Listeners
      socket.on('timetable:published', (payload) => {
        try {
          toast.success(`Timetable published for ${payload.batchId}`, {
            duration: 5000,
            icon: '📢'
          })
          dispatch(timetableApi.util.invalidateTags(['Timetable']))
        } catch (err) {
          console.error('Socket published error:', err)
        }
      })

      socket.on('timetable:slotUpdated', (payload) => {
        try {
          toast(`Slot updated in timetable ${payload.timetableId}`, {
            icon: '🔄'
          })
          dispatch(timetableApi.util.invalidateTags([{ type: 'Timetable', id: payload.timetableId }]))
        } catch (err) {
          console.error('Socket slotUpdated error:', err)
        }
      })

      socket.on('timetable:conflict', (payload) => {
        try {
          if (user?.role === 'admin') {
            toast.error(`New conflict detected in timetable ${payload.timetableId}`)
          }
        } catch (err) {
          console.error('Socket conflict error:', err)
        }
      })
    } catch (err) {
      console.error('Socket initialization error:', err)
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [isAuthenticated, user, dispatch])

  return socketRef.current
}

export default useSocket
