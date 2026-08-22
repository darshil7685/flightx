import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { LoadingState, ErrorState, EmptyState } from '../components/StateBlock.jsx';

const BROWSE_TERMS = ['A', 'E', 'I', 'O', 'U'];

export default function Airports() {
  const [state, setState] = useState('loading');
  const [airports, setAirports] = useState([]);

  useEffect(() => {
    async function loadAll() {
      setState('loading');
      try {
        const batches = await Promise.all(BROWSE_TERMS.map((t) => api.searchAirports(t)));
        const merged = new Map();
        batches.flat().forEach((a) => merged.set(a.iata, a));
        setAirports([...merged.values()].sort((a, b) => a.city.localeCompare(b.city)));
        setState('done');
      } catch (err) {
        setAirports(err.message);
        setState('error');
      }
    }
    loadAll();
  }, []);

  if (state === 'loading') return <LoadingState rows={4} />;
  if (state === 'error') return <ErrorState message={airports} />;
  if (airports.length === 0) {
    return (
      <EmptyState
        title="No destinations available yet"
        body="Destinations will appear here once flights are loaded."
      />
    );
  }

  return (
    <>
      <section className="page-hero">
        <h1 className="page-title">Destinations</h1>
        <p className="page-sub">
          Explore {airports.length} cities you can search on FlightX. Pick any city on the Flights
          page to start booking your trip.
        </p>
      </section>

      <div className="airport-grid">
        {airports.map((a) => (
          <div className="airport-card" key={a.iata}>
            <div className="iata">{a.iata}</div>
            <div className="city-name">{a.city}</div>
            <div className="city">
              {a.country}
              <span className="airport-name-inline"> · {a.name}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
