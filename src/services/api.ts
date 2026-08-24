// MedAI FastAPI REST API Client Services

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn(`[FastAPI Service Notice] ${endpoint} fetch failed, operating in resilient local mode:`, err);
    return null;
  }
}

export const apiService = {
  // Auth APIs
  auth: {
    login: async (email: string, password?: string) => {
      const data = await fetchAPI<{ access_token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: password || 'password' }),
      });
      return data;
    },
    getCurrentUser: async () => {
      return await fetchAPI<any>('/auth/me');
    },
  },

  // Patients APIs
  patients: {
    list: async () => await fetchAPI<any[]>('/patients/'),
    get: async (id: string) => await fetchAPI<any>(`/patients/${id}`),
    create: async (patientData: any) =>
      await fetchAPI<any>('/patients/', {
        method: 'POST',
        body: JSON.stringify(patientData),
      }),
  },

  // Alerts APIs
  alerts: {
    list: async (resolved?: boolean) => {
      const query = resolved !== undefined ? `?resolved=${resolved}` : '';
      return await fetchAPI<any[]>(`/alerts/${query}`);
    },
    resolve: async (id: string) =>
      await fetchAPI<any>(`/alerts/${id}/resolve`, {
        method: 'POST',
      }),
    create: async (alertData: any) =>
      await fetchAPI<any>('/alerts/', {
        method: 'POST',
        body: JSON.stringify(alertData),
      }),
  },

  // Claims APIs
  claims: {
    list: async () => await fetchAPI<any[]>('/claims/'),
    create: async (claimData: any) =>
      await fetchAPI<any>('/claims/', {
        method: 'POST',
        body: JSON.stringify(claimData),
      }),
  },

  // Beds APIs
  beds: {
    list: async () => await fetchAPI<any[]>('/beds/'),
    updateStatus: async (id: string, status: string) =>
      await fetchAPI<any>(`/beds/${id}/status?status=${status}`, {
        method: 'PUT',
      }),
  },

  // Monitoring APIs
  monitoring: {
    get: async (patientId?: string) => {
      const query = patientId ? `?patient_id=${patientId}` : '';
      return await fetchAPI<any[]>(`/monitoring/${query}`);
    },
    create: async (data: any) =>
      await fetchAPI<any>('/monitoring/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Security APIs
  security: {
    events: async () => await fetchAPI<any[]>('/security/events'),
    auditLogs: async () => await fetchAPI<any[]>('/security/audit-logs'),
  },
};
