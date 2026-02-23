import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Shield, CheckCircle2 } from 'lucide-react'
import { fraudApi } from './services/api'
import useModuleStatus from '../../hooks/useModuleStatus'
import Card from '../../components/Card'
import PageHeader from '../../components/PageHeader'
import ModuleLayout from '../../components/module/ModuleLayout'
import PreInsightLayout from '../../components/module/PreInsightLayout'
import StatsGrid from '../../components/module/StatsGrid'
import CsvUpload from '../../components/CsvUpload'
import AIRecommendations from '../../components/AIRecommendations'
import { useAuth } from '../../context/AuthContext'

const COLORS = { normal: '#3b82f6', fraud: '#f59e0b' }

function riskColor(pct: number): string {
  if (pct < 20) return 'text-emerald-400'
  if (pct <= 50) return 'text-amber-400'
  return 'text-red-400'
}

function riskBg(pct: number): string {
  if (pct < 20) return 'bg-emerald-500/20'
  if (pct <= 50) return 'bg-amber-500/20'
  return 'bg-red-500/20'
}

const unlockVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export default function FraudLens() {
  const [pieData, setPieData] = useState<{ name: string; value: number }[] | null>(null)
  const [fraudCount, setFraudCount] = useState<number | null>(null)
  const [normalCount, setNormalCount] = useState<number | null>(null)
  const [fraudPercentage, setFraudPercentage] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isClearing, setIsClearing] = useState(false)
  const { hasData, loading, refreshStatus } = useModuleStatus('fraud')
  const { token } = useAuth()

  const loadData = () => {
    fraudApi.insights().then((data) => {
      setFraudCount(data.anomalies_detected)
      setNormalCount(data.total_transactions - data.anomalies_detected)
      const pct = Math.round((data.anomalies_detected / data.total_transactions) * 100)
      setFraudPercentage(pct)
      setPieData([
        { name: 'Normal', value: data.total_transactions - data.anomalies_detected },
        { name: 'Fraud', value: data.anomalies_detected },
      ])
    }).catch(() => { })
  }

  useEffect(() => {
    if (hasData) loadData()
  }, [hasData])

  const handleFileUpload = async (file: File) => {
    setError(null)
    try {
      const data = await fraudApi.upload(file)
      setFraudCount(data.fraud_count)
      setNormalCount(data.normal_count)
      setFraudPercentage(data.fraud_percentage)
      setPieData([
        { name: 'Normal', value: data.normal_count },
        { name: 'Fraud', value: data.fraud_count },
      ])
      await refreshStatus()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPieData(null)
      setFraudCount(null)
      setNormalCount(null)
      setFraudPercentage(null)
    }
  }

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear current data and start new analysis?")) return;

    setIsClearing(true);
    try {
      await fraudApi.clear();
      setPieData(null);
      setFraudCount(null);
      setNormalCount(null);
      setFraudPercentage(null);
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
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ds-text-muted border-t-teal-400" />
        </div>
      </ModuleLayout>
    )
  }

  // ─── Pre-Insight State ────────────────────────────────────────────
  if (!hasData) {
    return (
      <ModuleLayout>
        <PreInsightLayout
          moduleTitle="Fraud Lens"
          tagline="Unmask hidden threats in your transaction data."
          bullets={[
            'Anomaly detection across all transactions',
            'Risk scoring and fraud distribution analysis',
            'Normal vs fraudulent transaction breakdown',
          ]}
          icon={Shield}
          accentColor="#2DD4BF"
          lockedMetrics={['Fraud Count', 'Normal Count', 'Risk Level']}
          csvColumns={['transaction_id', 'amount', 'is_fraud']}
          onUpload={handleFileUpload}
        />
      </ModuleLayout>
    )
  }

  // ─── Data View (Unlocked) ─────────────────────────────────────────
  const pct = fraudPercentage ?? 0

  return (
    <ModuleLayout>
      <motion.div initial="hidden" animate="visible" variants={unlockVariants}>
        <PageHeader
          title="Fraud Lens"
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
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/15 px-3 py-1 text-xs font-semibold text-teal-400 ring-1 ring-teal-500/30">
                <CheckCircle2 className="h-3.5 w-3.5" /> Insights Active
              </span>
              <CsvUpload
                onUpload={handleFileUpload}
                title="Upload Transactions"
                description="Scan CSV for fraud"
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
            <h3 className="mb-2 text-sm font-medium text-ds-text-muted">Fraud count</h3>
            <motion.p
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-3xl font-bold text-ds-text-primary"
            >
              {fraudCount ?? 0}
            </motion.p>
          </Card>
          <Card className="unlock-glow">
            <h3 className="mb-2 text-sm font-medium text-ds-text-muted">Normal count</h3>
            <p className="text-3xl font-bold text-ds-text-primary">{normalCount ?? 0}</p>
          </Card>
          <Card className="unlock-glow">
            <h3 className="mb-2 text-sm font-medium text-ds-text-muted">Risk level</h3>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${riskColor(pct)} ${riskBg(pct)}`}
            >
              {pct < 20 ? 'Low' : pct <= 50 ? 'Medium' : 'High'} ({pct}%)
            </motion.span>
          </Card>
        </StatsGrid>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={unlockVariants} transition={{ delay: 0.2 }}>
        <Card>
            <h3 className="mb-4 text-sm font-medium text-ds-text-muted">Fraud vs normal</h3>
            {pieData?.length ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      <Cell fill={COLORS.normal} />
                      <Cell fill={COLORS.fraud} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-lg bg-ds-bg-base/50 text-sm text-ds-text-muted">
                No chart data
              </div>
            )}
          </Card>
        </motion.div>

        <AIRecommendations endpoint="/fraud/recommendations" token={token} />
      </ModuleLayout>
    )
  }
