import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col print:bg-white print:min-h-0">
      <div className="print:hidden">
        <Navbar onMenuClick={toggleSidebar} className="mb-4" />
      </div>
      <div className="flex flex-1 relative overflow-hidden print:overflow-visible">
        <div className="print:hidden">
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        </div>
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm transition-opacity print:hidden"
            onClick={closeSidebar}
          />
        )}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-80px)] w-full print:overflow-visible print:h-auto print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
