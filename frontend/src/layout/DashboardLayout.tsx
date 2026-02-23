import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import ChatPanel from '../components/chat/ChatPanel'

/**
 * App shell for dashboard and modules — sidebar + main content + chat
 */
export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen bg-ds-bg-base">
      <DashboardSidebar open={sidebarOpen} onToggle={() => setSidebarOpen((o) => !o)} />
      <main className="relative flex-1 overflow-auto transition-all duration-300">
        {/* Subtle grid background — mission control feel */}
        <div
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.04] dark:opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgb(var(--ds-text-muted) / 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgb(var(--ds-text-muted) / 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </div>
      </main>
      <ChatPanel />
    </div>
  )
}
