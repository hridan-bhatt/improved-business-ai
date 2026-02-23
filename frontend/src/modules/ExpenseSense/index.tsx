import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts'
import { Receipt, CheckCircle2 } from 'lucide-react'
import { expenseApi } from './services/api'
import useModuleStatus from '../../hooks/useModuleStatus'
import Card from '../../components/Card'
import PageHeader from '../../components/PageHeader'
import ModuleLayout from '../../components/module/ModuleLayout'
import PreInsightLayout from '../../components/module/PreInsightLayout'
import StatsGrid from '../../components/module/StatsGrid'
import CsvUpload from '../../components/CsvUpload'
import AIRecommendations from '../../components/AIRecommendations'
import { useAuth } from '../../context/AuthContext'

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4']

type ChartItem = { name: string; value: number }
type TrendItem = { month: string; amount: number }
type Stats = { total: number; trend?: string; trend_percent?: number }

const unlockVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export default function ExpenseSense() {
  const [chartData, setChartData] = useState<ChartItem[] | null>(null)
  const [trends, setTrends] = useState<TrendItem[] | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isClearing, setIsClearing] = useState(false)
  const { hasData, loading, refreshStatus } = useModuleStatus('expense')
  const { token } = useAuth()

  const loadData = () => {
    expenseApi.summary().then((data) => {
      setChartData(data.by_category)
      setStats({ total: data.total, trend: data.trend, trend_percent: data.trend_percent })
    }).catch(() => { })
    expenseApi.trends().then(setTrends).catch(() => { })
  }

  useEffect(() => {
    if (hasData) loadData()
  }, [hasData])

  const handleFileUpload = async (file: File) => {
    setError(null)
    try {
      const data = await expenseApi.upload(file)
      const byCategory: ChartItem[] = (data.labels || []).map((label, i) => ({
        name: label,
        value: data.values?.[i] ?? 0,
      }))
      setChartData(byCategory.length ? byCategory : null)
      setStats({
        total: data.total ?? 0,
        trend: (data as { trend?: string }).trend,
        trend_percent: (data as { trend_percent?: number }).trend_percent,
      })
      if (data.trends?.length) {
        setTrends(data.trends)
      } else if (data.labels?.length && data.values?.length) {
        setTrends([{ month: 'Upload', amount: data.total ?? 0 }])
      } else {
        setTrends(null)
      }
      await refreshStatus()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setChartData(null)
      setTrends(null)
      setStats(null)
    }
  }

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear current data and start new analysis?")) return;

    setIsClearing(true);
    try {
      await expenseApi.clear();
      setChartData(null);
      setTrends(null);
      setStats(null);
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
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ds-text-muted border-t-blue-400" />
        </div>
      </ModuleLayout>
    )
  }

  // ─── Pre-Insight State ────────────────────────────────────────────
  if (!hasData) {
    return (
      <ModuleLayout>
        <PreInsightLayout
          moduleTitle="Expense Sense"
          tagline="Transform raw spending data into strategic intelligence."
          bullets={[
            'Category-wise breakdown of all expenses',
            'Monthly spending trend analysis',
            'Spending direction and anomaly detection',
          ]}
          icon={Receipt}
          accentColor="#3b82f6"
          lockedMetrics={['Total Expense', 'Trend Direction', 'Category Count']}
          csvColumns={['category', 'amount', 'month']}
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
          title="Expense Sense"
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
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-400 ring-1 ring-blue-500/30">
                <CheckCircle2 className="h-3.5 w-3.5" /> Insights Active
              </span>
              <CsvUpload
                onUpload={handleFileUpload}
                title="Upload Expenses"
                description="Process CSV records"
              />
            </div>
          }
        />
      </motion.div>

      {error && (
        <div className="rounded-lg bg-ds-accent-danger/10 border border-ds-accent-danger/30 px-4 py-3 text-sm text-ds-accent-danger">
          {error}
        </div>
      )}

      <motion.div initial="hidden" animate="visible" variants={unlockVariants} transition={{ delay: 0.1 }}>
        {/* Stats row */}
        <StatsGrid columns={3}>
          <Card className="unlock-glow">
            <h3 className="mb-2 text-sm font-medium text-ds-text-muted">Total expense</h3>
            <p className="text-3xl font-bold text-ds-text-primary">{stats?.total ?? 0}</p>
          </Card>
          <Card className="unlock-glow">
            <h3 className="mb-2 text-sm font-medium text-ds-text-muted">Trend</h3>
            {stats?.trend != null && stats.trend_percent != null ? (
              <div className="flex items-center gap-2">
                <span className={stats.trend === 'up' ? 'text-amber-400' : 'text-emerald-400'}>
                  {stats.trend === 'up' ? '↑' : '↓'} {Math.abs(stats.trend_percent)}%
                </span>
                <span className="text-sm text-ds-text-muted">vs previous</span>
              </div>
            ) : (
              <p className="text-lg text-ds-text-muted">—</p>
            )}
          </Card>
          <Card className="unlock-glow">
            <h3 className="mb-2 text-sm font-medium text-ds-text-muted">Categories</h3>
            <p className="text-3xl font-bold text-ds-text-primary">{chartData?.length ?? 0}</p>
          </Card>
        </StatsGrid>
      </motion.div>

      {/* Charts */}
      <motion.div
        className="grid gap-6 lg:grid-cols-2"
        initial="hidden"
        animate="visible"
        variants={unlockVariants}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <h3 className="mb-4 text-sm font-medium text-ds-text-muted">By category</h3>
          {chartData?.length ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {chartData.map((_entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg bg-ds-bg-base/50 text-sm text-ds-text-muted">
              No category data
            </div>
          )}
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-medium text-ds-text-muted">Monthly trend</h3>
          {trends?.length ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends}>
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg bg-ds-bg-base/50 text-sm text-ds-text-muted">
              No trend data
            </div>
          )}
          </Card>
        </motion.div>
        <AIRecommendations endpoint="/expense/recommendations" token={token} />
      </ModuleLayout>
    )
  }
