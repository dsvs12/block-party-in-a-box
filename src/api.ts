/**
 * API boundary aligned with docs/backend-spec.md. Set VITE_API_BASE when the
 * service is deployed; until then the UI operates against the local demo store.
 */
const apiBase = import.meta.env.VITE_API_BASE as string | undefined;

export type LocalDate = `${number}-${number}-${number}`;
export type SignatureState = 'counted' | 'duplicate_address' | 'off_block' | 'struck';
export type DateChecks = {
  petition_due: LocalDate;
  due_passed: boolean;
  season: { ok: boolean; problems: string[] };
  block_year_count: number;
  max: number;
};
export type RequestInput = {
  block_id: string;
  date_start: LocalDate;
  date_end: LocalDate;
  guests: number;
  services: { barricades: boolean; green_kit: boolean };
};

/**
 * Mocked sign-in for the demo: the API's dev auth accepts these fixed tokens (see api/README.md).
 * The role comes from the endpoint being called. Replace with the real identity service later.
 */
const env = import.meta.env;
const mockTokens = {
  resident: (env.VITE_DEV_TOKEN_RESIDENT as string | undefined) ?? 'dev-resident-a',
  vendor: (env.VITE_DEV_TOKEN_VENDOR as string | undefined) ?? 'dev-vendor-icecream',
  village: (env.VITE_DEV_TOKEN_VILLAGE as string | undefined) ?? 'dev-reviewer'
};
function mockTokenFor(path: string) {
  if (path.startsWith('/vendor')) return mockTokens.vendor;
  if (path.startsWith('/village') || path.startsWith('/ai/')) return mockTokens.village;
  return mockTokens.resident;
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiBase) throw new Error('API is not configured');
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${mockTokenFor(path)}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers ?? {})
    }
  });
  if (!response.ok) {
    const fallback = `Request failed (${response.status})`;
    try {
      const error = await response.json() as { message?: string; reasons?: string[] };
      throw new Error([error.message, ...(error.reasons ?? [])].filter(Boolean).join(' ') || fallback);
    } catch (error) {
      if (error instanceof Error && error.message !== fallback) throw error;
      throw new Error(fallback);
    }
  }
  return response.json() as Promise<T>;
}

export const endpoint = {
  rules: '/rules?year=2027',
  lookup: (address: string) => `/blocks/lookup?address=${encodeURIComponent(address)}`,
  createRequest: '/requests',
  createPetition: (id: string) => `/requests/${id}/petition`,
  residentRequests: '/me/requests',
  vendorOffer: '/vendor/offer',
  vendorMatches: '/vendor/matches?state=proposed',
  villageRequests: '/village/requests?sort=submitted_at',
  villageToday: (date: string) => `/village/day?date=${date}`
};

function idempotencyKey() {
  return globalThis.crypto?.randomUUID?.() ?? `bpib-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function post<T>(path: string, body?: unknown) {
  return request<T>(path, {
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: { 'Idempotency-Key': idempotencyKey() }
  });
}

/** Resident calls defined in docs/api/resident.openapi.yaml. Browser-only client; not a backend. */
export const residentApi = {
  getRules: (year = 2027) => request<unknown>(`/rules?year=${year}`),
  lookupBlock: (address: string) => request<unknown>(endpoint.lookup(address)),
  dateChecks: (input: Pick<RequestInput, 'block_id' | 'date_start' | 'date_end'>) => post<DateChecks>('/checks/dates', input),
  createRequest: (input: RequestInput) => post<unknown>('/requests', input),
  beginPetition: (requestId: string) => post<{ petition_url: string; petition_due: LocalDate }>(`/requests/${requestId}/petition`),
  signPetition: (token: string, input: { name: string; house_number: string; email?: string; consent: true; captcha: string }) => post<{ state: SignatureState; distinct_count: number; needed: number }>(`/petitions/${token}/signatures`, input),
  submitRequest: (requestId: string) => post<unknown>(`/requests/${requestId}/submit`),
  myRequests: () => request<{ requests?: unknown[] }>('/me/requests').then((d) => d.requests ?? [])
};

export const vendorApi = {
  me: () => request<unknown>('/vendor/me'),
  offer: () => request<unknown>('/vendor/offer'),
  summary: () => request<unknown>('/vendor/summary'),
  matches: () => request<{ matches?: unknown[] }>('/vendor/matches?state=proposed').then((d) => d.matches ?? []),
  jobs: () => request<{ jobs?: Record<string, unknown>[] }>('/vendor/jobs').then((d) => (d.jobs ?? []).map((job) => ({ event_date: job.date, ...job })))
};

export const villageApi = {
  requests: () => request<{ items?: unknown[] }>('/village/requests?sort=submitted_at').then((d) => ({ ...d, requests: d.items ?? [] })),
  today: (date: LocalDate) => request<unknown>(`/village/day?date=${date}`),
  whatIf: (date: LocalDate, closures: string[], treatAsWeekday = false) => post<unknown>('/village/whatif', { date, closures, treat_as_weekday: treatAsWeekday })
};

export const apiConfigured = Boolean(apiBase);
