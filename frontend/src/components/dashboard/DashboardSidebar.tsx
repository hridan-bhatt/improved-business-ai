import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import {
  Home,
  LayoutDashboard,
  Receipt,
  Shield,
  Package,
  Leaf,
  ChevronLeft,
  Settings,
  LogOut,
} from 'lucide-react'

const nav = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/modules/expense', label: 'Expense Sense', icon: Receipt },
  { to: '/modules/fraud', label: 'Fraud Lens', icon: Shield },
  { to: '/modules/inventory', label: 'Smart Inventory', icon: Package },
  { to: '/modules/green-grid', label: 'Green Grid', icon: Leaf },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const NAV_COLORS: Record<string, string> = {
  '/modules/expense': '#38AAF8',
  '/modules/fraud': '#20D2BA',
  '/modules/inventory': '#34D399',
  '/modules/green-grid': '#4ADE80',
}

export default function DashboardSidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const { user, logout } = useAuth()

  return (
    <motion.aside
      className="sticky top-0 flex h-screen flex-col overflow-hidden"
      initial={false}
      animate={{ width: open ? 248 : 72 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        background: 'linear-gradient(180deg, rgb(var(--ds-bg-elevated)) 0%, rgb(var(--ds-bg-base)) 100%)',
        borderRight: '1px solid rgb(var(--ds-border) / 0.08)',
      }}
    >
      {/* Header */}
      <div
        className="flex h-14 shrink-0 items-center justify-between px-3"
        style={{ borderBottom: '1px solid rgb(var(--ds-border) / 0.08)' }}
      >
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
            >
              <NavLink
                to="/"
                className="truncate text-base font-bold text-ds-text-primary transition-colors hover:text-ds-accent"
                style={{ fontFamily: 'var(--ds-font-display)' }}
              >
                Business AI
              </NavLink>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          type="button"
          onClick={onToggle}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-ds-text-muted transition-colors hover:bg-ds-bg-surface hover:text-ds-text-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <motion.div animate={{ rotate: open ? 0 : 180 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
            <ChevronLeft className="h-4 w-4" />
          </motion.div>
        </motion.button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden p-2">
        {nav.map(({ to, label, icon: Icon }) => {
          const accentColor = NAV_COLORS[to]
          return (
            <NavLink key={to} to={to} end={to === '/' || to === '/dashboard' || to === '/dashboard/settings'}>
              {({ isActive }) => (
                <motion.span
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200"
                  style={{
                    background: isActive ? 'rgb(var(--ds-accent) / 0.1)' : 'transparent',
                    color: isActive
                      ? (accentColor ?? 'rgb(var(--ds-accent))')
                      : 'rgb(var(--ds-text-secondary))',
                  }}
                  whileHover={{
                    x: open ? 2 : 0,
                    background: isActive ? 'rgb(var(--ds-accent) / 0.12)' : 'rgb(var(--ds-bg-surface) / 0.7)',
                    color: isActive
                      ? (accentColor ?? 'rgb(var(--ds-accent))')
                      : 'rgb(var(--ds-text-primary))',
                    transition: { duration: 0.18 },
                  }}
                >
                  <Icon
                    className="h-5 w-5 shrink-0"
                    style={{ color: isActive ? (accentColor ?? 'rgb(var(--ds-accent))') : undefined }}
                  />
                  <AnimatePresence>
                    {open && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {/* Active indicator dot when collapsed */}
                  {!open && isActive && (
                    <motion.span
                      className="absolute right-2 h-1.5 w-1.5 rounded-full"
                      style={{ background: accentColor ?? 'rgb(var(--ds-accent))' }}
                      layoutId="sidebar-active-dot"
                    />
                  )}
                </motion.span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div
        className="shrink-0 p-2"
        style={{ borderTop: '1px solid rgb(var(--ds-border) / 0.08)' }}
      >
        <AnimatePresence>
          {open && user && (
            <motion.p
              className="truncate px-3 py-1.5 text-xs text-ds-text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {user.full_name || user.email}
            </motion.p>
          )}
        </AnimatePresence>
        <motion.button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ds-text-muted transition-colors hover:bg-ds-bg-surface hover:text-ds-accent-danger"
          whileHover={{ x: open ? 1 : 0, transition: { duration: 0.18 } }}
          whileTap={{ scale: 0.97 }}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <AnimatePresence>
            {open && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Log out
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  )
}
