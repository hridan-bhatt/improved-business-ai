import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Leaf, CheckCircle2 } from 'lucide-react'
import { greenApi } from './services/api'
import useModuleStatus from '../../hooks/useModuleStatus'
import Card from '../../components/Card'
import PageHeader from '../../components/PageHeader'
import ModuleLayout from '../../components/module/ModuleLayout'
import PreInsightLayout from '../../components/module/PreInsightLayout'
import StatsGrid from '../../components/module/StatsGrid'
import CsvUpload from '../../components/CsvUpload'
import AIRecommendations from '../../components/AIRecommendations'
import { useAuth } from '../../context/AuthContext'

type ChartPoint = { name: string; usage: number }

const unlockVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export default function GreenGrid() {
  const [chartData, setChartData] = useState<ChartPoint[] | null>(null)
  const [average, setAverage] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isClearing, setIsClearing] = useState(false)
  const { hasData, loading, refreshStatus } = useModuleStatus('green-grid')
  const { token } = useAuth()

  const loadData = () => {
    greenApi.chart().then((data) => {
      setChartData(data.map((d) => ({ name: d.hour, usage: d.usage })))
    }).catch(() => { })
    greenApi.data().then((data) => {
      setAverage(data.current_usage_kwh)
    }).catch(() => { })
  }

  useEffect(() => {
    if (hasData) loadData()
  }, [hasData])

  const handleFileUpload = async (file: File) => {
    setError(null)
    try {
      const data = await greenApi.upload(file)
      const points: ChartPoint[] = (data.labels || []).map((label, i) => ({
        name: label,
        usage: data.values?.[i] ?? 0,
      }))
      setChartData(points.length ? points : null)
      setAverage(data.average ?? null)
      await refreshStatus()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setChartData(null)
      setAverage(null)
    }
  }

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear current data and start new analysis?")) return;

    setIsClearing(true);
    try {
      await greenApi.clear();
      setChartData(null);
      setAverage(null);
      setError(null);
      await refreshStatus();
      alert("Analysis reset successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to reset analysis.");
    } finally {
      setIsClearing(false);
    }
  };

  // ─── Loading State ──────────────────────────────────────────────
  if (loading) {
    return (
      <ModuleLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ds-text-muted border-t-green-400" />
        </div>
      </ModuleLayout>
    )
  }

  // ─── Pre-Insight State ────────────────────────────────────────────
  if (!hasData) {
    return (
      <ModuleLayout>
        <PreInsightLayout
          moduleTitle="Green Grid Optimizer"
          tagline="Optimize energy consumption with data-driven efficiency."
          bullets={[
            'Hourly and daily usage trend analysis',
            'Peak consumption detection and shift recommendations',
            'Environmental impact scoring and benchmarking',
          ]}
          icon={Leaf}
          accentColor="#4ADE80"
          lockedMetrics={['Average Usage (kWh)', 'Data Points', 'Grid Status']}
          csvColumns={['hour', 'usage_kwh']}
          onUpload={handleFileUpload}
        />
      </ModuleLayout>
    )
  }

  // ─── Data View (Unlocked) ─────────────────────────────────────────
  return (
    <ModuleLayout>
      <motion.div initial="hidden" animate="visible" variants={unlockVariants}>
        <PageHeader
          title="Green Grid Optimizer"
          action={
            <div className="flex items-center gap-3">
              {hasData && (
                <button
                  onClick={handleClearAll}
                  disabled={isClearing}
                  className="inline-flex items-center justify-center rounded-lg border border-red-500/30 bg-transparent px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                >
                  {isClearing ? 'Clearing...' : 'Start New Analysis'}
                </button>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-400 ring-1 ring-green-500/30">
                <CheckCircle2 className="h-3.5 w-3.5" /> Insights Active
              </span>
              <CsvUpload
                onUpload={handleFileUpload}
                title="Upload Grid Data"
                description="Process energy CSV records"
              />
            </div>
          }
        />
      </motion.div>

      {error && (
        <div className="rounded-lg border border-ds-accent-danger/30 bg-ds-accent-danger/10 px-4 py-3 text-sm text-ds-accent-danger">
          {error}
        </div>
      )}

      <motion.div initial="hidden" animate="visible" variants={unlockVariants} transition={{ delay: 0.1 }}>
        <StatsGrid columns={3}>
          <Card className="unlock-glow">
            <h3 className="mb-2 text-sm font-medium text-ds-text-muted">Average usage</h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold text-ds-text-primary"
            >
              {average != null ? `${average} kWh` : '—'}
            </motion.p>
          </Card>
          <Card className="unlock-glow">
            <h3 className="mb-2 text-sm font-medium text-ds-text-muted">Data points</h3>
            <p className="text-3xl font-bold text-ds-text-primary">{chartData?.length ?? 0}</p>
          </Card>
          <Card className="unlock-glow">
            <h3 className="mb-2 text-sm font-medium text-ds-text-muted">Status</h3>
            <p className="text-lg font-medium text-emerald-400">
              {chartData?.length ? 'Data loaded' : 'Awaiting upload'}
            </p>
          </Card>
        </StatsGrid>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={unlockVariants} transition={{ delay: 0.2 }}>
        <Card>
          <h3 className="mb-4 text-sm font-medium text-ds-text-muted">Usage trend</h3>
          {chartData?.length ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="h-64"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <Area type="monotone" dataKey="usage" stroke="#22c55e" fill="url(#usageGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg bg-ds-bg-base/50 text-sm text-ds-text-muted">
              No usage data
            </div>
          )}
          </Card>
        </motion.div>
        <AIRecommendations endpoint="/green-grid/recommendations" token={token} />
      </ModuleLayout>
    )
  }
