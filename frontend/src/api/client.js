import { sanitize } from './safe.js';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(path) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`);
  } catch (err) {
    throw new Error('offline');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return sanitize(await res.json());
}

async function post(path, body) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error('offline');
  }
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Request failed (${res.status})`);
  }
  return sanitize(await res.json());
}

export const api = {
  health: () => request('/api/health'),
  stats: () => request('/api/stats'),
  searchAirports: (q) => request(`/api/airports/search?q=${encodeURIComponent(q)}`),
  airportDetail: (iata) => request(`/api/airports/${iata}`),
  directRoutes: (from, to) => request(`/api/routes/direct?from=${from}&to=${to}`),
  connections: (from, to, maxStops, alliance) =>
    request(
      `/api/routes/connections?from=${from}&to=${to}&maxStops=${maxStops}` +
        (alliance ? `&alliance=${encodeURIComponent(alliance)}` : '')
    ),
  bottlenecks: (regionA, regionB) =>
    request(`/api/analysis/bottlenecks?regionA=${regionA}&regionB=${regionB}`),
  simulateClosure: (iata) => post('/api/simulate/closure', { iata }),
};
