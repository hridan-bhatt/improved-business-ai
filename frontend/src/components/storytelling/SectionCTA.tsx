import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function SectionCTA() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const beamX = useTransform(scrollYProgress, [0.25, 0.75], ['-25%', '125%'])
  const { token, isValid } = useAuth()
  const isLoggedIn = !!token && isValid

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-28 md:py-36"
      style={{ background: 'rgb(var(--ds-bg-base))' }}
    >
      {/* Deep gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(165deg, rgb(var(--ds-bg-elevated)) 0%, rgb(var(--ds-bg-base)) 38%, rgb(var(--ds-bg-elevated)) 72%, rgb(var(--ds-bg-base)) 100%)',
        }}
      />
      {/* Central radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 85% 65% at 50% 42%, rgb(var(--ds-accent) / 0.1) 0%, transparent 58%)',
        }}
      />
      {/* Moving light beam */}
      <motion.div
        className="pointer-events-none absolute inset-0 top-1/2 h-72 w-[45%] -translate-y-1/2 blur-[50px]"
        style={{
          x: beamX,
          background: 'linear-gradient(90deg, transparent, rgb(var(--ds-accent) / 0.12), transparent)',
          opacity: 0.4,
        }}
      />
      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(14)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: i % 3 === 0 ? '6px' : '4px',
              height: i % 3 === 0 ? '6px' : '4px',
              left: `${12 + i * 6.5}%`,
              top: `${18 + (i % 5) * 16}%`,
              background: i % 2 === 0 ? 'rgb(var(--ds-accent))' : 'rgb(var(--ds-accent-teal))',
              opacity: 0.12 + (i % 4) * 0.06,
            }}
            animate={{
              y: [0, -18, 0],
              opacity: [0.15, 0.32, 0.15],
            }}
            transition={{
              duration: 4.5 + i * 0.28,
              repeat: Infinity,
              delay: i * 0.18,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      {/* Noise */}
      <div className="noise-overlay" />

      <motion.div
        className="relative z-10 mx-auto max-w-3xl px-6 text-center"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{
              borderColor: 'rgb(var(--ds-accent) / 0.28)',
              background: 'rgb(var(--ds-accent) / 0.06)',
              color: 'rgb(var(--ds-accent))',
            }}
          >
            Get started
          </span>
        </motion.div>

        <h2 className="font-display text-[2.4rem] font-bold leading-tight text-ds-text-primary md:text-[3rem]">
          Ready to run{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, rgb(var(--ds-accent)), rgb(var(--ds-accent-teal)))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            smarter?
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ds-text-secondary">
          Join teams that use Business AI to see clearer, act faster, and stay ahead of risk.
        </p>

        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.18, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link to={isLoggedIn ? '/dashboard' : '/login'} className="group relative inline-block">
            {/* Outer diffuse glow */}
            <span
              className="absolute -inset-2 rounded-2xl opacity-0 blur-xl transition-all duration-500 group-hover:opacity-60"
              style={{
                background: 'linear-gradient(135deg, rgb(var(--ds-accent)), rgb(var(--ds-accent-teal)))',
              }}
              aria-hidden
            />
            <motion.span
              className="relative flex items-center gap-3 rounded-[14px] px-9 py-4 font-semibold text-white"
              style={{
                background: 'linear-gradient(135deg, rgb(var(--ds-accent)) 0%, rgb(var(--ds-accent-teal)) 100%)',
                boxShadow: '0 6px 28px rgb(var(--ds-accent) / 0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
              whileHover={{
                y: -3,
                boxShadow: '0 10px 36px rgb(var(--ds-accent) / 0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
                transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
              }}
              whileTap={{ scale: 0.97, y: 0, transition: { duration: 0.1 } }}
            >
              <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[14px]" aria-hidden>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
              </span>
              <span className="relative">{isLoggedIn ? 'Open dashboard' : 'Get started free'}</span>
              <ArrowRight className="relative h-4 w-4" />
            </motion.span>
          </Link>
        </motion.div>

        <p className="mt-6 text-sm text-ds-text-muted">No credit card required. Start in minutes.</p>
      </motion.div>
    </section>
  )
}
