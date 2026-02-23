import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { BarChart3, TrendingUp, DollarSign, Activity } from 'lucide-react'

export default function SectionProductPreview() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0.1, 0.5], [70, -55])
  const scale = useTransform(scrollYProgress, [0.1, 0.38], [0.93, 1])
  const opacity = useTransform(scrollYProgress, [0.08, 0.28], [0.4, 1])

  return (
    <section
      id="product"
      ref={ref}
      className="relative overflow-hidden py-28 md:py-36"
      style={{ background: 'rgb(var(--ds-bg-base))' }}
    >
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: 'radial-gradient(ellipse 60% 48% at 50% 38%, rgb(var(--ds-accent) / 0.1) 0%, transparent 58%)',
        }}
      />
      {/* Noise */}
      <div className="noise-overlay" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4"
        >
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{
              borderColor: 'rgb(var(--ds-accent) / 0.28)',
              background: 'rgb(var(--ds-accent) / 0.06)',
              color: 'rgb(var(--ds-accent))',
            }}
          >
            Product
          </span>
        </motion.div>
        <motion.h2
          className="font-display text-[2.1rem] font-bold text-ds-text-primary md:text-[2.5rem]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          Your command center for{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, rgb(var(--ds-accent)), rgb(var(--ds-accent-teal)))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            business intelligence
          </span>
        </motion.h2>
        <motion.p
          className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ds-text-secondary"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          One dashboard. All your metrics. Real-time decisions.
        </motion.p>
      </div>

      {/* Mockup */}
      <motion.div
        style={{ y, scale, opacity }}
        className="relative z-10 mx-auto mt-16 max-w-4xl px-6"
      >
        {/* Ambient glow behind mockup */}
        <div
          className="absolute inset-x-8 -inset-y-4 scale-[0.92] rounded-3xl blur-3xl"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgb(var(--ds-accent) / 0.18), transparent 70%)',
            opacity: 0.7,
          }}
        />

        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: 'linear-gradient(145deg, rgb(var(--ds-bg-surface)) 0%, rgb(var(--ds-bg-elevated)) 100%)',
            boxShadow: '0 32px 80px -12px rgb(0 0 0 / 0.28), 0 0 0 1px rgb(var(--ds-border) / 0.1)',
          }}
        >
          {/* Window chrome */}
          <div
            className="flex items-center gap-2 border-b px-6 py-4"
            style={{ borderColor: 'rgb(var(--ds-border) / 0.1)' }}
          >
            <div className="h-2.5 w-2.5 rounded-full bg-ds-accent-danger opacity-80" />
            <div className="h-2.5 w-2.5 rounded-full bg-ds-accent-warning opacity-80" />
            <div className="h-2.5 w-2.5 rounded-full bg-ds-accent-success opacity-80" />
            <span className="ml-4 text-xs font-medium text-ds-text-muted">Business AI — Dashboard</span>
          </div>

          {/* Stats row */}
          <div className="grid gap-4 p-6 sm:grid-cols-4">
            {[
              { label: 'Revenue', value: '$124.2k', change: '+12%', icon: DollarSign, positive: true },
              { label: 'Expenses', value: '$48.1k', change: '-5%', icon: BarChart3, positive: true },
              { label: 'Health', value: '94', change: '+2', icon: Activity, positive: true },
              { label: 'Forecast', value: '↑ 8%', change: 'Q4', icon: TrendingUp, positive: true },
            ].map(({ label, value, change, icon: Icon, positive }) => (
              <motion.div
                key={label}
                className="rounded-xl p-4"
                style={{
                  background: 'linear-gradient(145deg, rgb(var(--ds-bg-base) / 0.7), rgb(var(--ds-bg-base) / 0.4))',
                  border: '1px solid rgb(var(--ds-border) / 0.08)',
                }}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 + 0.06 * ['Revenue', 'Expenses', 'Health', 'Forecast'].indexOf(label) }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-ds-text-muted">{label}</span>
                  <Icon className="h-3.5 w-3.5 text-ds-accent opacity-70" />
                </div>
                <p className="mt-2 text-xl font-bold text-ds-text-primary">{value}</p>
                <p className="mt-0.5 text-xs font-medium" style={{ color: positive ? 'rgb(var(--ds-accent-success))' : 'rgb(var(--ds-accent-danger))' }}>{change}</p>
              </motion.div>
            ))}
          </div>

          {/* Chart area — animated bars */}
          <div
            className="mx-6 mb-6 rounded-xl p-4"
            style={{
              background: 'rgb(var(--ds-bg-base) / 0.5)',
              border: '1px solid rgb(var(--ds-border) / 0.07)',
              height: '140px',
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-ds-text-muted">Revenue trend</span>
              <div className="flex items-center gap-3 text-xs text-ds-text-muted">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-ds-accent" />Revenue</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-ds-accent-teal" />Expenses</span>
              </div>
            </div>
            <div className="flex h-16 items-end gap-2">
              {[0.45, 0.62, 0.55, 0.78, 0.68, 0.85, 0.92, 0.75, 0.88, 0.95, 0.82, 1.0].map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{ background: `linear-gradient(to top, rgb(var(--ds-accent) / 0.8), rgb(var(--ds-accent) / 0.3))`, transformOrigin: 'bottom', height: '100%' }}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: h }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  />
              ))}
            </div>
          </div>
        </div>

        {/* Floating metric chips */}
        {[
          { label: 'Fraud risk', value: 'Low', top: '18%', right: '-2%', x: 20, delay: 0.5 },
          { label: 'Inventory', value: 'Optimal', top: '45%', left: '-3%', x: -20, delay: 0.6 },
          { label: 'AI Score', value: '98%', bottom: '16%', right: '4%', x: 16, delay: 0.7 },
        ].map(({ label, value, top, left, right, bottom, x, delay }) => (
          <motion.div
            key={label}
            className="absolute rounded-xl px-4 py-2.5"
            style={{
              top: top ?? undefined,
              left: left ?? undefined,
              right: right ?? undefined,
              bottom: bottom ?? undefined,
              background: 'linear-gradient(145deg, rgb(var(--ds-bg-surface)), rgb(var(--ds-bg-elevated)))',
              boxShadow: 'var(--ds-surface-shadow)',
              border: '1px solid rgb(var(--ds-border) / 0.1)',
            }}
            initial={{ opacity: 0, x }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-xs text-ds-text-muted">{label}</p>
            <p className="text-base font-semibold text-ds-text-primary">{value}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
