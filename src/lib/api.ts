const API_BASE = '/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Something went wrong');
  }
  return response.json();
}

export const api = {
  login: (credentials: any) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  signup: (userData: any) => apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify(userData) }),
  getProfile: (id: string) => apiFetch(`/users/${id}`),
  updateProfile: (id: string, data: any) => apiFetch(`/users/${id}/onboarding`, { method: 'POST', body: JSON.stringify(data) }),
  toggleSharing: (id: string, enabled: boolean) => apiFetch(`/users/${id}/sharing`, { method: 'POST', body: JSON.stringify({ enabled }) }),
  getRecords: (patientId: string, requesterId: string) => apiFetch(`/records/patient/${patientId}?requesterId=${requesterId}`),
  uploadRecord: (formData: FormData) => fetch(`${API_BASE}/records/upload`, { method: 'POST', body: formData }).then(res => res.ok ? res.json() : res.json().then(e => { throw new Error(e.error) })),
  getReminders: (patientId: string) => apiFetch(`/reminders/${patientId}`),
  addReminder: (data: any) => apiFetch('/reminders', { method: 'POST', body: JSON.stringify(data) }),
  deleteReminder: (id: string) => apiFetch(`/reminders/${id}`, { method: 'DELETE' }),
};
