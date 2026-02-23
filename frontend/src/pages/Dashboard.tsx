import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Receipt, Shield, Package, Leaf, Download, ArrowUpRight } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import * as api from '../services/api'
import { expenseApi } from '../modules/ExpenseSense/services/api'
import { AnimatedCounter } from '../components/ui/AnimatedCounter'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { staggerContainer, staggerItem } from '../animations/transitions'

const modules = [
  { to: '/modules/expense', label: 'Expense Sense', icon: Receipt, color: '#38AAF8', accent: 'rgba(56,170,248,0.1)' },
  { to: '/modules/fraud', label: 'Fraud Lens', icon: Shield, color: '#20D2BA', accent: 'rgba(32,210,186,0.1)' },
  { to: '/modules/inventory', label: 'Smart Inventory', icon: Package, color: '#34D399', accent: 'rgba(52,211,153,0.1)' },
  { to: '/modules/green-grid', label: 'Green Grid', icon: Leaf, color: '#4ADE80', accent: 'rgba(74,222,128,0.08)' },
]

const CHART_COLORS = ['#38AAF8', '#34D399', '#20D2BA', '#4ADE80', '#22D3EE', '#A78BFA']

const STAGGER_CONTAINER = {
  initial: {},
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const FADE_ITEM = {
  initial: { opacity: 0, y: 20, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function Dashboard() {
  const [health, setHealth] = useState<Awaited<ReturnType<typeof api.health.score>> | null>(null)
  const [recs, setRecs] = useState<Awaited<ReturnType<typeof api.recommendations.list>> | null>(null)
  const [carbon, setCarbon] = useState<Awaited<ReturnType<typeof api.carbon.estimate>> | null>(null)
  const [expenseSummary, setExpenseSummary] = useState<Awaited<ReturnType<typeof expenseApi.summary>> | null>(null)
  const [reportLoading, setReportLoading] = useState(false)

  useEffect(() => {
    api.health.score().then(setHealth).catch(() => setHealth(null))
    api.recommendations.list().then(setRecs).catch(() => setRecs(null))
    api.carbon.estimate().then(setCarbon).catch(() => setCarbon(null))
    expenseApi.summary().then(setExpenseSummary).catch(() => setExpenseSummary(null))
  }, [])

  async function handleDownloadReport() {
    setReportLoading(true)
    try {
      const blob = await api.report.pdf()
      const url = URL.createObjectURL(blob as Blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'business_report.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // ignore
    } finally {
      setReportLoading(false)
    }
  }

  const healthScore = health?.score ?? 0
  const healthColor =
    healthScore >= 80 ? '#34D399' : healthScore >= 65 ? '#38AAF8' : healthScore >= 50 ? '#FBBF24' : '#F87171'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-10"
    >
      {/* Page header */}
      <motion.div
        className="pb-2"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1
          className="text-2xl font-bold text-ds-text-primary md:text-3xl"
          style={{ fontFamily: 'var(--ds-font-display)' }}
        >
          Business Intelligence
        </h1>
        <p className="mt-1.5 text-ds-text-secondary">
          Key metrics, modules, and AI recommendations
        </p>
        {/* Thin accent rule */}
        <div
          className="mt-4 h-px w-16"
          style={{ background: 'linear-gradient(90deg, rgb(var(--ds-accent)), transparent)' }}
        />
      </motion.div>

      {/* Business Health Score */}
      <section>
        <motion.h2
          className="mb-4 text-sm font-semibold uppercase tracking-wider text-ds-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Business Health Score
        </motion.h2>
        <motion.div
          className="overflow-hidden rounded-2xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: 'linear-gradient(145deg, rgb(var(--ds-bg-surface)) 0%, rgb(var(--ds-bg-elevated)) 100%)',
            boxShadow: 'var(--ds-surface-shadow)',
            border: '1px solid rgb(var(--ds-border) / 0.07)',
          }}
        >
          {health ? (
            <div className="flex flex-col items-center p-8 md:flex-row md:items-center md:justify-around">
              <div className="flex flex-col items-center">
                <svg className="h-40 w-40" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="2.5"
                  />
                  <motion.path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={healthColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={`${healthScore}, 100`}
                    initial={{ strokeDasharray: '0, 100' }}
                    animate={{ strokeDasharray: `${healthScore}, 100` }}
                    transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                    style={{ filter: `drop-shadow(0 0 4px ${healthColor}88)` }}
                  />
                </svg>
                <AnimatedCounter value={healthScore} className="mt-3 text-4xl font-bold" />
                <span className="text-sm text-ds-text-muted">/ 100</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 md:mt-0">
                {health.factors.map((f, i) => (
                  <motion.div
                    key={f.name}
                    className="rounded-xl px-4 py-3"
                    style={{
                      background: 'linear-gradient(145deg, rgb(var(--ds-bg-elevated)), rgb(var(--ds-bg-base) / 0.7))',
                      border: '1px solid rgb(var(--ds-border) / 0.07)',
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.45, delay: 0.3 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="text-xs font-medium text-ds-text-muted">{f.name}</p>
                    <p className="mt-0.5 text-lg font-bold text-ds-text-primary">{f.score}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8"><LoadingSkeleton /></div>
          )}
        </motion.div>
      </section>

      {/* Modules */}
      <section>
        <motion.h2
          className="mb-4 text-sm font-semibold uppercase tracking-wider text-ds-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          Modules
        </motion.h2>
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {modules.map(({ to, label, icon: Icon, color, accent }) => (
            <motion.div key={to} variants={staggerItem}>
              <Link
                to={to}
                className="group flex items-center gap-4 overflow-hidden rounded-2xl p-5 transition-all duration-300"
                style={{
                  background: 'linear-gradient(145deg, rgb(var(--ds-bg-surface)), rgb(var(--ds-bg-elevated)))',
                  boxShadow: 'var(--ds-card-shadow)',
                  border: '1px solid rgb(var(--ds-border) / 0.07)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = 'var(--ds-surface-shadow)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'var(--ds-card-shadow)'
                }}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
                  style={{ background: accent, border: `1px solid ${color}30` }}
                >
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block font-semibold text-ds-text-primary">{label}</span>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-ds-text-muted opacity-0 transition-opacity duration-200 group-hover:opacity-100" style={{ color }} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Expense chart + AI Recs */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Expense by category */}
        <section>
          <motion.h2
            className="mb-4 text-sm font-semibold uppercase tracking-wider text-ds-text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Expense by category
          </motion.h2>
          <motion.div
            className="rounded-2xl p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: 'linear-gradient(145deg, rgb(var(--ds-bg-surface)), rgb(var(--ds-bg-elevated)))',
              boxShadow: 'var(--ds-card-shadow)',
              border: '1px solid rgb(var(--ds-border) / 0.07)',
            }}
          >
            {expenseSummary?.by_category ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseSummary.by_category}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={3}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseSummary.by_category.map((_entry, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'rgb(var(--ds-bg-surface))',
                        border: '1px solid rgb(var(--ds-border) / 0.1)',
                        borderRadius: '12px',
                        color: 'rgb(var(--ds-text-primary))',
                        padding: '10px 14px',
                        boxShadow: 'var(--ds-surface-shadow)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <LoadingSkeleton />
            )}
          </motion.div>
        </section>

        {/* AI Recommendations */}
        <section>
          <motion.h2
            className="mb-4 text-sm font-semibold uppercase tracking-wider text-ds-text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            AI Recommendations
          </motion.h2>
          <motion.div
            className="rounded-2xl p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: 'linear-gradient(145deg, rgb(var(--ds-bg-surface)), rgb(var(--ds-bg-elevated)))',
              boxShadow: 'var(--ds-card-shadow)',
              border: '1px solid rgb(var(--ds-border) / 0.07)',
            }}
          >
            {recs ? (
              <motion.div
                className="space-y-3"
                variants={STAGGER_CONTAINER}
                initial="initial"
                animate="animate"
              >
                {recs.map((r) => (
                  <motion.div
                    key={r.id}
                    variants={FADE_ITEM}
                    className="group flex items-center gap-4 rounded-xl p-4 transition-all duration-200"
                    style={{
                      background: 'rgb(var(--ds-bg-elevated))',
                      border: '1px solid rgb(var(--ds-border) / 0.06)',
                    }}
                    whileHover={{ x: 3, transition: { duration: 0.2 } }}
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base"
                      style={{ background: 'rgb(var(--ds-accent) / 0.1)' }}
                    >
                      💡
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ds-text-primary">{r.title}</p>
                      <p className="text-xs text-ds-text-muted capitalize">{r.priority} priority</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <LoadingSkeleton />
            )}
          </motion.div>
        </section>
      </div>

      {/* Carbon + Report */}
      <section>
        <motion.h2
          className="mb-4 text-sm font-semibold uppercase tracking-wider text-ds-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          Sustainability & Reports
        </motion.h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <motion.div
            className="rounded-2xl p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.27, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: 'linear-gradient(145deg, rgb(var(--ds-bg-surface)), rgb(var(--ds-bg-elevated)))',
              boxShadow: 'var(--ds-card-shadow)',
              border: '1px solid rgb(var(--ds-border) / 0.07)',
            }}
          >
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ds-text-muted">Carbon footprint</h3>
            {carbon ? (
              <div className="flex items-center gap-5">
                <div
                  className="rounded-xl px-5 py-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(52,211,153,0.07))',
                    border: '1px solid rgba(52,211,153,0.2)',
                  }}
                >
                  <AnimatedCounter value={carbon.kg_co2_per_year} className="text-2xl font-bold text-ds-accent-success" />
                  <span className="ml-1 text-sm text-ds-text-secondary">kg CO₂/yr</span>
                </div>
                <div>
                  <p className="font-medium text-ds-text-primary">{carbon.equivalent}</p>
                  <p className="text-xs text-ds-text-muted">Rating: {carbon.rating}</p>
                </div>
              </div>
            ) : (
              <LoadingSkeleton />
            )}
          </motion.div>
          <motion.div
            className="rounded-2xl p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: 'linear-gradient(145deg, rgb(var(--ds-bg-surface)), rgb(var(--ds-bg-elevated)))',
              boxShadow: 'var(--ds-card-shadow)',
              border: '1px solid rgb(var(--ds-border) / 0.07)',
            }}
          >
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ds-text-muted">Report</h3>
            <button
              type="button"
              onClick={handleDownloadReport}
              disabled={reportLoading}
              className="group flex items-center gap-2.5 rounded-xl px-5 py-3 font-semibold text-white transition-all duration-200 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, rgb(var(--ds-accent)), rgb(var(--ds-accent-teal)))',
                boxShadow: '0 4px 16px rgb(var(--ds-accent) / 0.3)',
              }}
              onMouseEnter={(e) => {
                if (!reportLoading) {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 6px 22px rgb(var(--ds-accent) / 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 16px rgb(var(--ds-accent) / 0.3)'
              }}
            >
              {reportLoading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Download className="h-5 w-5" />
              )}
              Download PDF Report
            </button>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
