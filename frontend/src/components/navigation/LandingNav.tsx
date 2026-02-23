import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

export default function LandingNav() {
  const location = useLocation()
  const { token, isValid } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isLoggedIn = !!token && isValid
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 md:px-10 ${
        scrolled
          ? 'nav-scrolled border-b border-white/10 shadow-[0_1px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-white/5'
          : 'border-b border-transparent'
      }`}
    >
      {/* Logo */}
      <Link
        to="/"
        className="group relative text-lg font-bold tracking-tight text-ds-text-primary transition-colors hover:text-ds-accent"
        style={{ fontFamily: 'var(--ds-font-display)' }}
      >
        Business AI
        <span
          className="absolute -bottom-0.5 left-0 h-px w-0 transition-all duration-300 group-hover:w-full"
          style={{ background: 'linear-gradient(90deg, rgb(var(--ds-accent)), rgb(var(--ds-accent-teal)))' }}
        />
      </Link>

      {/* Nav links */}
      <nav className="flex items-center gap-1 sm:gap-2">
        {[{ to: '/', label: 'Home' }].map(({ to, label }) => {
          const isActive = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className="group relative px-3 py-2 text-sm font-medium transition-colors"
              style={{ color: isActive ? 'rgb(var(--ds-text-primary))' : 'rgb(var(--ds-text-secondary))' }}
            >
              <span className="relative z-10 transition-colors duration-200 group-hover:text-ds-text-primary">
                {label}
              </span>
              {/* Active underline */}
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    className="absolute bottom-1 left-3 right-3 h-px rounded-full"
                    style={{ background: 'linear-gradient(90deg, rgb(var(--ds-accent)), rgb(var(--ds-accent-teal)))' }}
                    layoutId="nav-underline"
                    initial={{ opacity: 0, scaleX: 0.4 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0.4 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </AnimatePresence>
              {/* Hover bg pill */}
              <span
                className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                style={{ background: 'rgb(var(--ds-bg-surface) / 0.5)' }}
              />
            </Link>
          )
        })}

        {/* Theme toggle */}
        <motion.button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-ds-text-secondary transition-colors hover:bg-ds-bg-surface/80 hover:text-ds-text-primary"
          whileTap={{ scale: 0.9, transition: { duration: 0.1 } }}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <AnimatePresence mode="wait">
            {theme === 'dark' ? (
              <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Sun className="h-5 w-5" aria-hidden />
              </motion.div>
            ) : (
              <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Moon className="h-5 w-5" aria-hidden />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* CTA button */}
        <Link to={isLoggedIn ? '/dashboard' : '/login'} className="group relative">
          <span
            className="absolute -inset-0.5 rounded-xl opacity-0 blur-md transition-all duration-300 group-hover:opacity-50"
            style={{ background: 'linear-gradient(135deg, rgb(var(--ds-accent)), rgb(var(--ds-accent-teal)))' }}
            aria-hidden
          />
          <motion.span
            className="relative flex items-center rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{
              background: 'linear-gradient(135deg, rgb(var(--ds-accent)) 0%, rgb(var(--ds-accent-teal)) 100%)',
              boxShadow: '0 2px 12px rgb(var(--ds-accent) / 0.28)',
            }}
            whileHover={{ y: -1, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.97, y: 0, transition: { duration: 0.1 } }}
          >
            {isLoggedIn ? 'Dashboard' : 'Sign in'}
          </motion.span>
        </Link>
      </nav>
    </header>
  )
}
