// FraudLens — Animated tabs: Overview | Flagged Alerts | AI Insights
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
import { Shield, CheckCircle2, AlertTriangle, Eye, Scan, RefreshCw, X, DollarSign, Store, Clock, Copy, Cpu, Loader2 } from 'lucide-react'
import { fraudApi, ExplainResult, ExplainPoint } from './services/api'
import useModuleStatus from '../../hooks/useModuleStatus'
import ModuleLayout from '../../components/module/ModuleLayout'
import PreInsightLayout from '../../components/module/PreInsightLayout'
import CsvUpload from '../../components/CsvUpload'
import AIRecommendations from '../../components/AIRecommendations'
import { useAuth } from '../../context/AuthContext'

const ACCENT = '#20D2BA'

function riskColor(pct: number) {
  if (pct < 20) return '#22c594'
  if (pct <= 50) return '#fbbf24'
  return '#f84646'
}
function riskLabel(pct: number) {
  if (pct < 20) return 'LOW RISK'
  if (pct <= 50) return 'MEDIUM'
  return 'HIGH RISK'
}

/* ── 3D Tilt ─────────────────────────────────────────────── */
function TiltCard({ children, style = {}, className = '' }: {
  children: React.ReactNode; style?: React.CSSProperties; className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0); const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 400, damping: 40 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 400, damping: 40 })
  const glowX = useTransform(x, [-0.5, 0.5], [0, 100])
  const glowY = useTransform(y, [-0.5, 0.5], [0, 100])
  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - r.left) / r.width - 0.5)
    y.set((e.clientY - r.top) / r.height - 0.5)
  }, [x, y])
  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', ...style }}
      onMouseMove={handleMove}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      className={className}
    >
      <motion.div className="pointer-events-none absolute inset-0 rounded-2xl z-10"
        style={{
          background: useTransform([glowX, glowY], ([gx, gy]) =>
            `radial-gradient(circle at ${gx}% ${gy}%, rgba(32,210,186,0.07) 0%, transparent 55%)`)
        }} />
      {children}
    </motion.div>
  )
}

/* ── Animated threat ring ─────────────────────────────────── */
function ThreatRing({ pct, color }: { pct: number; color: string }) {
  const r = 52
  const circ = 2 * Math.PI * r
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={66} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="9" />
      <motion.circle
        cx="70" cy="70" r={r} fill="none"
        stroke={color} strokeWidth="9" strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (circ * pct) / 100 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        transform="rotate(-90 70 70)"
        style={{ filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color}55)` }}
      />
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * 360 - 90
        const rad = (angle * Math.PI) / 180
        const x1 = 70 + (r - 2) * Math.cos(rad)
        const y1 = 70 + (r - 2) * Math.sin(rad)
        const x2 = 70 + (r - 9) * Math.cos(rad)
        const y2 = 70 + (r - 9) * Math.sin(rad)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      })}
    </svg>
  )
}

/* ── Scan line animation ──────────────────────────────────── */
function ScanLines() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl opacity-30">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(32,210,186,0.4), transparent)' }}
          initial={{ top: '-1px' }}
          animate={{ top: '100%' }}
          transition={{ duration: 3, delay: i * 1.1, repeat: Infinity, repeatDelay: 0.5, ease: 'linear' }}
        />
      ))}
    </div>
  )
}

/* ── Tooltip ─────────────────────────────────────────────── */
const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs"
      style={{
        background: 'rgb(var(--ds-bg-surface))', border: `1px solid ${ACCENT}25`,
        color: 'rgb(var(--ds-text-primary))', fontFamily: 'var(--ds-font-mono)',
        boxShadow: 'var(--ds-surface-shadow)',
      }}>
      {label && <p className="mb-1" style={{ color: 'rgb(var(--ds-text-muted))' }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill || p.color || ACCENT }}>
          {p.name}: <strong>{p.value?.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  )
}

const reveal = {
  hidden: { opacity: 0, y: 22, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.58, ease: [0.16, 1, 0.3, 1] } },
}

/* ── Explain icon map ─────────────────────────────────── */
const ICON_MAP: Record<ExplainPoint['icon'], React.ElementType> = {
  amount:    DollarSign,
  vendor:    Store,
  hours:     Clock,
  duplicate: Copy,
  model:     Cpu,
}

/* ── Explain Modal ────────────────────────────────────── */
function ExplainModal({ result, onClose }: { result: ExplainResult; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-lg overflow-hidden rounded-2xl"
          style={{
            background: 'rgb(var(--ds-bg-surface))',
            border: `1px solid ${ACCENT}22`,
            boxShadow: 'var(--ds-surface-shadow-lg)',
          }}
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-start justify-between p-5 pb-4"
            style={{ borderBottom: '1px solid rgb(var(--ds-border) / 0.1)' }}>
            <div>
              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}25` }}>
                  <Eye className="h-3.5 w-3.5" style={{ color: ACCENT }} />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: ACCENT, fontFamily: 'var(--ds-font-mono)', opacity: 0.8 }}>
                  Explainability Report
                </span>
              </div>
              <h2 className="text-base font-black" style={{ color: 'rgb(var(--ds-text-primary))', fontFamily: 'var(--ds-font-display)' }}>
                Transaction&nbsp;
                <span style={{ color: ACCENT, fontFamily: 'var(--ds-font-mono)', fontWeight: 700 }}>
                  {result.transaction_id}
                </span>
              </h2>
              <p className="mt-0.5 text-xs" style={{ color: 'rgb(var(--ds-text-muted))', fontFamily: 'var(--ds-font-mono)' }}>
                Amount: <strong style={{ color: '#f84646' }}>${result.amount?.toLocaleString()}</strong>
                &ensp;·&ensp;Status: <strong style={{ color: '#f84646' }}>FLAGGED</strong>
              </p>
            </div>
            <button onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors"
              style={{ color: 'rgb(var(--ds-text-muted))', background: 'rgb(var(--ds-bg-elevated))' }}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2.5 p-5">
            {result.points.map((pt, i) => {
              const Icon = ICON_MAP[pt.icon] ?? Cpu
              const isWarning = ['amount', 'vendor', 'hours', 'duplicate'].includes(pt.icon)
              const accentCol = isWarning ? '#f84646' : ACCENT
              return (
                <motion.div key={i} className="flex gap-3 rounded-xl p-3.5"
                  style={{ background: `${accentCol}07`, border: `1px solid ${accentCol}18` }}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${accentCol}12`, border: `1px solid ${accentCol}25` }}>
                    <Icon className="h-3.5 w-3.5" style={{ color: accentCol }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: accentCol, fontFamily: 'var(--ds-font-mono)' }}>
                      {pt.label}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed" style={{ color: 'rgb(var(--ds-text-secondary))' }}>
                      {pt.detail}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
          <div className="px-5 pb-5">
            <p className="text-[10px]" style={{ color: 'rgb(var(--ds-text-muted))', fontFamily: 'var(--ds-font-mono)' }}>
              Explanations are statistical signals — not legal determinations. Review with your compliance team.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ── Animated Tab Bar ────────────────────────────────────── */
type TabId = 'overview' | 'alerts' | 'ai'
const TABS: { id: TabId; label: string; count?: number }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'alerts',   label: 'Flagged Alerts' },
  { id: 'ai',       label: 'AI Insights' },
]

function AnimatedTabBar({ active, onChange, alertCount }: {
  active: TabId; onChange: (t: TabId) => void; alertCount: number
}) {
  return (
    <div className="relative flex gap-1 rounded-2xl p-1"
      style={{ background: 'rgb(var(--ds-bg-elevated))', border: '1px solid rgb(var(--ds-border) / 0.1)' }}>
      {TABS.map(t => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className="relative z-10 flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-colors duration-150"
          style={{
            color: active === t.id ? ACCENT : 'rgb(var(--ds-text-muted))',
            fontFamily: 'var(--ds-font-mono)',
            letterSpacing: '0.06em',
          }}
        >
          {active === t.id && (
            <motion.div
              layoutId="fraud-tab-pill"
              className="absolute inset-0 rounded-xl"
              style={{ background: `${ACCENT}14`, border: `1px solid ${ACCENT}28` }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            />
          )}
          <span className="relative">{t.label}</span>
          {t.id === 'alerts' && alertCount > 0 && (
            <span className="relative rounded-full px-1.5 py-0.5 text-[9px] font-black"
              style={{ background: 'rgba(248,70,70,0.15)', color: '#f84646' }}>
              {alertCount}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export default function FraudLens() {
  const [pieData, setPieData] = useState<{ name: string; value: number }[] | null>(null)
  const [fraudCount, setFraudCount] = useState<number | null>(null)
  const [normalCount, setNormalCount] = useState<number | null>(null)
  const [fraudPct, setFraudPct] = useState<number | null>(null)
  const [alerts, setAlerts] = useState<{ id: string; type: string; score: number }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isClearing, setIsClearing] = useState(false)
  const [explainResult, setExplainResult] = useState<ExplainResult | null>(null)
  const [explainLoading, setExplainLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const { hasData, loading, refreshStatus } = useModuleStatus('fraud')
  const { token } = useAuth()

  const loadData = useCallback(() => {
    fraudApi.insights().then((data) => {
      setFraudCount(data.anomalies_detected)
      setNormalCount(data.total_transactions - data.anomalies_detected)
      const pct = data.total_transactions > 0
        ? Math.round((data.anomalies_detected / data.total_transactions) * 100)
        : 0
      setFraudPct(pct)
      setPieData([
        { name: 'Normal', value: data.total_transactions - data.anomalies_detected },
        { name: 'Fraud', value: data.anomalies_detected },
      ])
      setAlerts(data.alerts.map(a => ({ id: String(a.id), type: a.type, score: a.score })))
    }).catch(() => {})
  }, [])

  useEffect(() => { if (hasData) loadData() }, [hasData, loadData])

  const handleFileUpload = async (file: File) => {
    setError(null)
    try {
      const data = await fraudApi.upload(file)
      setFraudCount(data.fraud_count)
      setNormalCount(data.normal_count)
      setFraudPct(data.fraud_percentage)
      setPieData([
        { name: 'Normal', value: data.normal_count },
        { name: 'Fraud', value: data.fraud_count },
      ])
      await refreshStatus()
      loadData()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPieData(null); setFraudCount(null); setNormalCount(null); setFraudPct(null)
    }
  }

  const handleClearAll = async () => {
    if (!window.confirm('Clear all fraud data?')) return
    setIsClearing(true)
    try {
      await fraudApi.clear()
      setPieData(null); setFraudCount(null); setNormalCount(null); setFraudPct(null)
      setAlerts([]); setError(null)
      await refreshStatus()
    } catch { alert('Failed to reset.') } finally { setIsClearing(false) }
  }

  const handleExplain = async (transactionId: string) => {
    setExplainLoading(transactionId)
    try {
      const result = await fraudApi.explain(transactionId)
      setExplainResult(result)
    } catch {
      // no-op
    } finally {
      setExplainLoading(null)
    }
  }

  if (loading) return (
    <ModuleLayout>
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: ACCENT }} />
      </div>
    </ModuleLayout>
  )

  if (!hasData) return (
    <ModuleLayout>
      <PreInsightLayout
        moduleTitle="Fraud Lens"
        tagline="Unmask hidden threats in your transaction data."
        bullets={[
          'Anomaly detection across all transactions',
          'Risk scoring and fraud distribution analysis',
          'Normal vs fraudulent transaction breakdown',
        ]}
        icon={Shield} accentColor={ACCENT}
        lockedMetrics={['Fraud Count', 'Normal Count', 'Risk Level']}
        csvColumns={['transaction_id', 'amount', 'is_fraud']}
        onUpload={handleFileUpload}
      />
    </ModuleLayout>
  )

  const pct = fraudPct ?? 0
  const color = riskColor(pct)
  const total = (fraudCount ?? 0) + (normalCount ?? 0)

  const radarData = [
    { subject: 'Volume',     A: Math.min(100, (total / 100) * 20 + 40), fullMark: 100 },
    { subject: 'Fraud %',    A: pct,                                      fullMark: 100 },
    { subject: 'Anomaly',    A: Math.min(100, pct * 1.5 + 10),           fullMark: 100 },
    { subject: 'Pattern',    A: Math.max(10, 100 - pct * 0.8),           fullMark: 100 },
    { subject: 'Risk Score', A: pct,                                      fullMark: 100 },
  ]

  return (
    <ModuleLayout>
      {/* ── Header ────────────────────────────────────── */}
      <motion.div initial="hidden" animate="visible" variants={reveal}
        className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}28`, boxShadow: `0 0 16px ${ACCENT}18` }}>
              <Shield className="h-4.5 w-4.5" style={{ color: ACCENT }} />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full animate-pulse"
                style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em]"
                style={{ color: ACCENT, fontFamily: 'var(--ds-font-mono)', opacity: 0.7 }}>
                Security Module
              </p>
              <h1 className="text-2xl font-black leading-tight md:text-3xl"
                style={{
                  fontFamily: 'var(--ds-font-display)',
                  background: `linear-gradient(135deg, rgb(var(--ds-text-primary)) 40%, ${ACCENT} 100%)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                Fraud Lens
              </h1>
            </div>
          </div>
          <p className="text-xs" style={{ color: 'rgba(108,128,162,0.8)', fontFamily: 'var(--ds-font-mono)' }}>
            Anomaly detection · Threat intelligence · Risk scoring
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold"
            style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}22`, color: ACCENT, fontFamily: 'var(--ds-font-mono)', letterSpacing: '0.08em' }}>
            <Scan className="h-3 w-3" /> SCANNING ACTIVE
          </span>
          <motion.button onClick={loadData}
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: 'rgb(var(--ds-bg-elevated))', border: '1px solid rgb(var(--ds-border) / 0.12)', color: 'rgb(var(--ds-text-muted))' }}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
            <RefreshCw className="h-3.5 w-3.5" />
          </motion.button>
          {hasData && (
            <button onClick={handleClearAll} disabled={isClearing}
              className="rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] transition-all disabled:opacity-50"
              style={{ border: '1px solid rgba(248,70,70,0.22)', color: 'rgba(248,70,70,0.75)', fontFamily: 'var(--ds-font-mono)', background: 'transparent' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,70,70,0.07)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
              {isClearing ? 'Clearing…' : 'Reset'}
            </button>
          )}
          <CsvUpload onUpload={handleFileUpload} title="Upload Transactions" description="transaction_id, amount, is_fraud" />
        </div>
      </motion.div>

      {/* ── Tab Bar ───────────────────────────────────── */}
      <AnimatedTabBar active={activeTab} onChange={setActiveTab} alertCount={alerts.length} />

      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(248,70,70,0.07)', border: '1px solid rgba(248,70,70,0.22)', color: '#f84646' }}>
          {error}
        </motion.div>
      )}

      {/* ── Tab Content ───────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div key="overview"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6">

            {/* Stats row */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Threat gauge */}
              <div className="relative overflow-hidden rounded-2xl p-5"
                style={{ background: 'rgb(var(--ds-bg-surface))', border: `1px solid ${color}22`, boxShadow: `0 0 30px ${color}08` }}>
                <div className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full blur-3xl"
                  style={{ background: `${color}20` }} />
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: 'rgb(var(--ds-text-muted))', fontFamily: 'var(--ds-font-mono)' }}>
                  Threat Level
                </p>
                <div className="flex items-center gap-4">
                  <div className="relative flex h-[100px] w-[100px] items-center justify-center shrink-0">
                    <ThreatRing pct={pct} color={color} />
                    <div className="absolute flex flex-col items-center">
                      <span className="text-xl font-black tabular-nums" style={{ color, fontFamily: 'var(--ds-font-mono)' }}>{pct}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-black" style={{ color, fontFamily: 'var(--ds-font-display)' }}>{riskLabel(pct)}</p>
                    <p className="text-xs" style={{ color: 'rgba(108,128,162,0.7)', fontFamily: 'var(--ds-font-mono)' }}>fraud detection rate</p>
                  </div>
                </div>
              </div>

              {/* Fraud count */}
              <div className="relative overflow-hidden rounded-2xl p-5"
                style={{ background: 'rgb(var(--ds-bg-surface))', border: '1px solid rgba(248,70,70,0.18)', boxShadow: '0 0 30px rgba(248,70,70,0.05)' }}>
                <ScanLines />
                <div className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full blur-3xl"
                  style={{ background: 'rgba(248,70,70,0.18)' }} />
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: 'rgb(var(--ds-text-muted))', fontFamily: 'var(--ds-font-mono)' }}>Fraud Detected</p>
                  <AlertTriangle className="h-3.5 w-3.5" style={{ color: '#f84646' }} />
                </div>
                <p className="text-4xl font-black tabular-nums" style={{ color: '#f84646', fontFamily: 'var(--ds-font-display)' }}>
                  {(fraudCount ?? 0).toLocaleString()}
                </p>
                <p className="mt-1 text-xs" style={{ color: 'rgba(108,128,162,0.65)', fontFamily: 'var(--ds-font-mono)' }}>anomalous transactions</p>
              </div>

              {/* Normal count */}
              <div className="relative overflow-hidden rounded-2xl p-5"
                style={{ background: 'rgb(var(--ds-bg-surface))', border: '1px solid rgba(34,197,148,0.18)', boxShadow: '0 0 30px rgba(34,197,148,0.05)' }}>
                <div className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full blur-3xl"
                  style={{ background: 'rgba(34,197,148,0.15)' }} />
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: 'rgb(var(--ds-text-muted))', fontFamily: 'var(--ds-font-mono)' }}>Clean Transactions</p>
                  <CheckCircle2 className="h-3.5 w-3.5" style={{ color: '#22c594' }} />
                </div>
                <p className="text-4xl font-black tabular-nums" style={{ color: '#22c594', fontFamily: 'var(--ds-font-display)' }}>
                  {(normalCount ?? 0).toLocaleString()}
                </p>
                <p className="mt-1 text-xs" style={{ color: 'rgba(108,128,162,0.65)', fontFamily: 'var(--ds-font-mono)' }}>verified normal</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <TiltCard className="relative overflow-hidden rounded-2xl p-6"
                style={{ background: 'rgb(var(--ds-bg-surface))', border: `1px solid ${ACCENT}12`, boxShadow: 'var(--ds-card-shadow)' }}>
                <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full blur-3xl"
                  style={{ background: `${ACCENT}06` }} />
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: 'rgb(var(--ds-text-muted))', fontFamily: 'var(--ds-font-mono)' }}>
                  FRAUD VS NORMAL DISTRIBUTION
                </p>
                {pieData?.length ? (
                  <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
                    <div className="h-56 w-full sm:w-64 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                            innerRadius={60} outerRadius={90} paddingAngle={4} strokeWidth={0}>
                            <Cell fill="#22c594" />
                            <Cell fill="#f84646" />
                          </Pie>
                          <Tooltip content={<ChartTip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-3 w-full">
                      {[
                        { label: 'Normal', value: normalCount ?? 0, color: '#22c594', pct: total > 0 ? 100 - pct : 0 },
                        { label: 'Fraud',  value: fraudCount ?? 0,  color: '#f84646', pct },
                      ].map((item) => (
                        <div key={item.label} className="rounded-xl p-3.5"
                          style={{ background: `${item.color}07`, border: `1px solid ${item.color}18` }}>
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                              <span className="text-xs font-semibold" style={{ color: 'rgb(var(--ds-text-secondary))' }}>{item.label}</span>
                            </div>
                            <span className="text-sm font-black tabular-nums" style={{ color: item.color, fontFamily: 'var(--ds-font-mono)' }}>
                              {item.value.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-1 overflow-hidden rounded-full" style={{ background: 'rgb(var(--ds-border) / 0.1)' }}>
                            <motion.div className="h-full rounded-full"
                              style={{ background: item.color, boxShadow: `0 0 6px ${item.color}50` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${item.pct}%` }}
                              transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-56 items-center justify-center text-xs"
                    style={{ color: 'rgb(var(--ds-text-muted))', fontFamily: 'var(--ds-font-mono)' }}>
                    No distribution data
                  </div>
                )}
              </TiltCard>

              <TiltCard className="relative overflow-hidden rounded-2xl p-6"
                style={{ background: 'rgb(var(--ds-bg-surface))', border: 'solid 1px rgba(248,70,70,0.1)', boxShadow: 'var(--ds-card-shadow)' }}>
                <div className="pointer-events-none absolute -left-6 -top-6 h-28 w-28 rounded-full blur-3xl"
                  style={{ background: 'rgba(248,70,70,0.06)' }} />
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: 'rgb(var(--ds-text-muted))', fontFamily: 'var(--ds-font-mono)' }}>
                  THREAT PROFILE ANALYSIS
                </p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius={80}>
                      <PolarGrid stroke="rgb(var(--ds-border) / 0.1)" />
                      <PolarAngleAxis dataKey="subject"
                        tick={{ fontSize: 10, fontFamily: 'var(--ds-font-mono)', fill: 'rgb(var(--ds-text-muted))' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]}
                        tick={{ fontSize: 9, fill: 'rgb(var(--ds-text-muted))' }} />
                      <Radar name="Threat" dataKey="A" stroke={color} fill={color} fillOpacity={0.12} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </TiltCard>
            </div>

            {/* Analysis summary */}
            <div className="relative overflow-hidden rounded-2xl p-6"
              style={{ background: 'rgb(var(--ds-bg-surface))', border: `1px solid ${color}15`, boxShadow: 'var(--ds-card-shadow)' }}>
              <ScanLines />
              <div className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full blur-3xl"
                style={{ background: `${color}06` }} />
              <div className="mb-4 flex items-center gap-2">
                <Eye className="h-4 w-4" style={{ color: ACCENT }} />
                <p className="text-[10px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: 'rgb(var(--ds-text-muted))', fontFamily: 'var(--ds-font-mono)' }}>
                  ANALYSIS SUMMARY
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  { label: 'Total Scanned', value: total.toLocaleString(), color: ACCENT },
                  { label: 'Fraud Rate',    value: `${pct}%`,              color },
                  { label: 'Anomalies',     value: (fraudCount ?? 0).toLocaleString(), color: '#f84646' },
                  { label: 'Threat Level',  value: riskLabel(pct).split(' ')[0], color },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl p-3.5"
                    style={{ background: 'rgb(var(--ds-bg-elevated))', border: '1px solid rgb(var(--ds-border) / 0.08)' }}>
                    <p className="mb-1 text-[10px] uppercase tracking-[0.1em]"
                      style={{ color: 'rgb(var(--ds-text-muted))', fontFamily: 'var(--ds-font-mono)' }}>
                      {item.label}
                    </p>
                    <p className="text-xl font-black tabular-nums"
                      style={{ color: item.color, fontFamily: 'var(--ds-font-display)' }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Flagged Alerts Tab */}
        {activeTab === 'alerts' && (
          <motion.div key="alerts"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
            {alerts.length > 0 ? (
              <div className="relative overflow-hidden rounded-2xl p-6"
                style={{ background: 'rgb(var(--ds-bg-surface))', border: '1px solid rgba(248,70,70,0.12)', boxShadow: 'var(--ds-card-shadow)' }}>
                <div className="mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" style={{ color: '#f84646' }} />
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: 'rgb(var(--ds-text-muted))', fontFamily: 'var(--ds-font-mono)' }}>
                    FLAGGED TRANSACTIONS
                  </p>
                  <span className="ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold"
                    style={{ background: 'rgba(248,70,70,0.1)', color: '#f84646', fontFamily: 'var(--ds-font-mono)' }}>
                    {alerts.length} flagged
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs" style={{ fontFamily: 'var(--ds-font-mono)' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgb(var(--ds-border) / 0.1)' }}>
                        {['Transaction ID', 'Type', 'Risk Score', 'Action'].map(h => (
                          <th key={h} className="pb-2 pr-4 text-left font-semibold"
                            style={{ color: 'rgb(var(--ds-text-muted))' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.map((alert, i) => (
                        <motion.tr key={alert.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          style={{ borderBottom: '1px solid rgb(var(--ds-border) / 0.06)' }}>
                          <td className="py-2.5 pr-4 font-medium" style={{ color: ACCENT }}>{alert.id}</td>
                          <td className="py-2.5 pr-4" style={{ color: 'rgb(var(--ds-text-secondary))' }}>{alert.type}</td>
                          <td className="py-2.5 pr-4">
                            <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                              style={{
                                background: alert.score > 0.5 ? 'rgba(248,70,70,0.1)' : 'rgba(251,191,36,0.1)',
                                color: alert.score > 0.5 ? '#f84646' : '#fbbf24',
                              }}>
                              {alert.score.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-2.5">
                            <motion.button
                              onClick={() => handleExplain(alert.id)}
                              disabled={explainLoading === alert.id}
                              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.06em] disabled:opacity-60"
                              style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}25`, color: ACCENT }}
                              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                              {explainLoading === alert.id
                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                : <Eye className="h-3 w-3" />}
                              Explain
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-2xl"
                style={{ background: 'rgb(var(--ds-bg-surface))', border: '1px solid rgba(248,70,70,0.1)' }}>
                <p className="text-sm" style={{ color: 'rgb(var(--ds-text-muted))', fontFamily: 'var(--ds-font-mono)' }}>
                  No flagged transactions
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'ai' && (
          <motion.div key="ai"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
            <AIRecommendations endpoint="/fraud/recommendations" token={token} />
          </motion.div>
        )}

      </AnimatePresence>

      {/* Explain Modal */}
      {explainResult && (
        <ExplainModal result={explainResult} onClose={() => setExplainResult(null)} />
      )}
    </ModuleLayout>
  )
}
