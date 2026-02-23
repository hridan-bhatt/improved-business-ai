import { motion } from 'framer-motion'
import { Upload, Cpu, TrendingUp, Sparkles } from 'lucide-react'

const STEPS = [
  {
    icon: Upload,
    title: 'Connect your data',
    desc: 'Link expenses, inventory, and sustainability sources in one place.',
    color: '#38AAF8',
    num: '01',
  },
  {
    icon: Cpu,
    title: 'AI analyzes & learns',
    desc: 'Our engine detects patterns, anomalies, and opportunities in real time.',
    color: '#20D2BA',
    num: '02',
  },
  {
    icon: TrendingUp,
    title: 'Act on insights',
    desc: 'Get clear recommendations and forecasts so you can optimize with confidence.',
    color: '#34D399',
    num: '03',
  },
  {
    icon: Sparkles,
    title: 'Scale with clarity',
    desc: 'From single teams to the whole business. Stay in control as you grow.',
    color: '#A78BFA',
    num: '04',
  },
]

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 32, filter: 'blur(8px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.75, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function SectionHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative w-full overflow-hidden px-6 py-24 md:py-32"
      style={{ background: 'rgb(var(--ds-bg-elevated))' }}
    >
      {/* Ambient radial */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[50vh] w-full -translate-x-1/2 opacity-40 dark:opacity-30"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgb(var(--ds-accent) / 0.1) 0%, transparent 65%)',
        }}
      />
      {/* Noise */}
      <div className="noise-overlay" />

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-16 text-center">
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
              How it works
            </span>
          </motion.div>
          <motion.h2
            className="font-display text-[2.1rem] font-bold text-ds-text-primary md:text-[2.5rem]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            Four steps to smarter business
          </motion.h2>
        </div>

        {/* Cards grid */}
        <div className="grid gap-5 sm:grid-cols-2">
          {STEPS.map(({ icon: Icon, title, desc, color, num }, i) => (
            <motion.div
              key={title}
              variants={CARD_VARIANTS}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              className="group relative overflow-hidden rounded-2xl p-7 transition-all duration-300"
              style={{
                background: 'linear-gradient(145deg, rgb(var(--ds-bg-surface)) 0%, rgb(var(--ds-bg-elevated)) 100%)',
                boxShadow: 'var(--ds-card-shadow)',
                border: '1px solid rgb(var(--ds-border) / 0.07)',
              }}
              whileHover={{
                y: -4,
                boxShadow: 'var(--ds-surface-shadow)',
                transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
              }}
            >
              {/* Big step number — ghost */}
              <span
                className="pointer-events-none absolute right-4 top-3 select-none text-6xl font-black opacity-[0.04] transition-opacity duration-300 group-hover:opacity-[0.07]"
                style={{ color, fontFamily: 'var(--ds-font-display)', lineHeight: 1 }}
              >
                {num}
              </span>

              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: `linear-gradient(145deg, ${color}20, ${color}0d)`,
                  border: `1px solid ${color}25`,
                }}
              >
                <Icon className="h-6 w-6" style={{ color }} />
              </div>
              <h3 className="text-lg font-semibold text-ds-text-primary">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ds-text-secondary">{desc}</p>

              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full"
                style={{ background: `linear-gradient(90deg, ${color}aa, transparent)` }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
