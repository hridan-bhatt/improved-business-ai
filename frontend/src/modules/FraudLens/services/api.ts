import { api, uploadCsv } from '../../../services/api'

export const fraudApi = {
    status: () => api<{ has_data: boolean }>('/fraud/status'),
    insights: () => api<{ anomalies_detected: number; total_transactions: number; risk_level: string; alerts: { id: number; type: string; score: number }[] }>('/fraud/insights'),
    chart: () => api<{ day: string; normal: number; flagged: number }[]>('/fraud/chart'),
    upload: (file: File) =>
        uploadCsv<{ fraud_count: number; normal_count: number; fraud_percentage: number }>('/fraud/upload-csv', file),
    clear: () => api<{ message: string }>('/fraud/clear', { method: 'DELETE' }),
}
