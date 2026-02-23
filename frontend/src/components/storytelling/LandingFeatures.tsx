import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Receipt, Shield, Package, Leaf, TrendingUp, Zap, BarChart3 } from 'lucide-react'

const VALUE_HIGHLIGHTS = [
  {
    icon: TrendingUp,
    title: 'Better decisions',
    line: 'AI surfaces what matters so you act on signal, not noise.',
  },
  {
    icon: Zap,
    title: 'One place',
    line: 'Expenses, risk, inventory, and sustainability in a single platform.',
  },
  {
    icon: BarChart3,
    title: 'Real outcomes',
    line: 'Reduce waste, catch fraud earlier, and hit targets with confidence.',
  },
]

const MODULES = [
  { icon: Receipt, title: 'Expense Sense', desc: 'Track and analyze spending by category with clear trends.', color: '#38AAF8', accent: 'rgba(56,170,248,0.12)' },
  { icon: Shield, title: 'Fraud Lens', desc: 'Anomaly detection and alerts to protect your revenue.', color: '#20D2BA', accent: 'rgba(32,210,186,0.12)' },
  { icon: Package, title: 'Smart Inventory', desc: 'Forecasts and reorder suggestions so you never stock out.', color: '#34D399', accent: 'rgba(52,211,153,0.12)' },
  { icon: Leaf, title: 'Green Grid', desc: 'Energy optimization and carbon footprint insights.', color: '#4ADE80', accent: 'rgba(74,222,128,0.10)' },
]

const CONTAINER_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
}

const SLIDE_IN_LEFT = {
  hidden: { opacity: 0, x: -24 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
}

const SLIDE_IN_RIGHT = {
  hidden: { opacity: 0, x: 24, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function LandingFeatures() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0.1, 0.4], [32, -18])
  const bgOpacity = useTransform(scrollYProgress, [0.0, 0.25], [0, 1])

  return (
    <section id="features" ref={ref} className="relative overflow-hidden py-24 md:py-32"
      style={{ background: 'rgb(var(--ds-bg-elevated))' }}
    >
      {/* Subtle background radial */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: bgOpacity,
          background: 'radial-gradient(ellipse 70% 50% at 80% 50%, rgb(var(--ds-accent) / 0.06) 0%, transparent 60%)',
        }}
      />
      {/* Noise */}
      <div className="noise-overlay" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 text-center"
        >
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{
              borderColor: 'rgb(var(--ds-accent) / 0.28)',
              background: 'rgb(var(--ds-accent) / 0.06)',
              color: 'rgb(var(--ds-accent))',
            }}
          >
            Everything you need
          </span>
        </motion.div>

        <motion.div style={{ y }} className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-20">
          {/* Left: heading + value highlights */}
          <div>
            <motion.h2
              className="font-display text-[2.1rem] font-bold leading-tight text-ds-text-primary md:text-[2.5rem]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              One platform.{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, rgb(var(--ds-accent)), rgb(var(--ds-accent-teal)))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                AI-driven
              </span>{' '}
              insights.
            </motion.h2>
            <motion.p
              className="mt-5 text-lg leading-relaxed text-ds-text-secondary"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              Get clarity across spending, risk, inventory, and sustainability — so you can focus on outcomes, not spreadsheets.
            </motion.p>
            <motion.ul
              className="mt-10 space-y-7"
              variants={CONTAINER_VARIANTS}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
            >
              {VALUE_HIGHLIGHTS.map(({ icon: Icon, title, line }, i) => (
                <motion.li
                  key={title}
                  variants={SLIDE_IN_LEFT}
                  custom={i}
                  className="flex items-start gap-4"
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 hover:scale-105"
                    style={{
                      background: 'linear-gradient(145deg, rgb(var(--ds-bg-surface)), rgb(var(--ds-bg-elevated)))',
                      boxShadow: 'var(--ds-card-shadow)',
                      border: '1px solid rgb(var(--ds-border) / 0.08)',
                    }}
                  >
                    <Icon className="h-5 w-5 text-ds-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ds-text-primary">{title}</h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-ds-text-secondary">{line}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          {/* Right: module cards */}
          <motion.div
            className="space-y-4"
            variants={CONTAINER_VARIANTS}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {MODULES.map(({ icon: Icon, title, desc, color, accent }, i) => (
              <motion.div
                key={title}
                variants={SLIDE_IN_RIGHT}
                custom={i}
                className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300"
                style={{
                  background: `linear-gradient(145deg, rgb(var(--ds-bg-surface)) 0%, rgb(var(--ds-bg-elevated)) 100%)`,
                  boxShadow: 'var(--ds-card-shadow)',
                  border: '1px solid rgb(var(--ds-border) / 0.07)',
                }}
                whileHover={{
                  y: -3,
                  boxShadow: 'var(--ds-surface-shadow)',
                  transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
                }}
              >
                {/* Accent glow corner on hover */}
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: color, opacity: 0 }}
                />
                <div className="flex items-start gap-4">
                  <div
                    className="flex shrink-0 rounded-xl p-2.5 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: accent }}
                  >
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ds-text-primary">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ds-text-secondary">{desc}</p>
                  </div>
                </div>
                {/* Bottom accent line */}
                <div
                  className="absolute bottom-0 left-0 h-px w-0 transition-all duration-500 group-hover:w-full"
                  style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
