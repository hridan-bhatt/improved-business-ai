const API_BASE = 'http://localhost:8000'

function getToken(): string | null {
  return localStorage.getItem('business_ai_token')
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (res.status === 401) {
    localStorage.removeItem('business_ai_token')
    localStorage.removeItem('business_ai_user')
    window.location.href = '/login'
    throw new Error('UNAUTHORIZED')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  if (res.headers.get('content-type')?.includes('application/json')) return res.json()
  return res.blob() as Promise<T>
}

/** Upload CSV to an endpoint; do not set Content-Type (FormData needs boundary) */
export async function uploadCsv<T>(path: string, file: File): Promise<T> {
  const token = getToken()
  const formData = new FormData()
  formData.append('file', file)
  const headers: HeadersInit = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    body: formData,
    headers,
  })
  if (res.status === 401) {
    localStorage.removeItem('business_ai_token')
    localStorage.removeItem('business_ai_user')
    window.location.href = '/login'
    throw new Error('UNAUTHORIZED')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(typeof err.detail === 'string' ? err.detail : 'Upload failed')
  }
  return res.json()
}

// Auth
export async function login(email: string, password: string) {
  return api<{ access_token: string; user: { email: string; full_name?: string } }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function register(full_name: string, email: string, password: string) {
  return api<{ access_token: string; user: { email: string; full_name?: string } }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ full_name, email, password }),
  })
}

// Modules




export const health = {
  score: () => api<{ score: number; level: string; color: string; factors: { name: string; score: number }[] }>('/health/score'),
}
export const recommendations = {
  list: () => api<{ id: number; category: string; icon: string; title: string; priority: string }[]>('/recommendations'),
}
export const carbon = {
  estimate: () => api<{ kg_co2_per_year: number; equivalent: string; rating: string; suggestions: string[] }>('/carbon/estimate'),
}
export const report = {
  pdf: () => api<Blob>('/report/pdf'),
}
export const chat = {
  message: (message: string, history: { role: string; content: string }[]) =>
    api<{ role: string; content: string }>('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    }),
}

export const ai = {
  ask: (question: string, moduleData: Record<string, unknown>) =>
    api<{ answer: string; metrics_used?: string[] }>('/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ question, module_data: moduleData }),
    }),
}
