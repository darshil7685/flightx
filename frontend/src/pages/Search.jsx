import { useState } from 'react';
import SearchCard from '../components/SearchCard.jsx';
import StatsGrid from '../components/StatsGrid.jsx';
import RouteResults from '../components/RouteResults.jsx';
import { api } from '../api/client.js';

const POPULAR = [
  { from: { iata: 'BLR', name: 'Kempegowda International', city: 'Bengaluru', country: 'India' }, to: { iata: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'United States' } },
  { from: { iata: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', city: 'Mumbai', country: 'India' }, to: { iata: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'United States' } },
  { from: { iata: 'DEL', name: 'Indira Gandhi International', city: 'New Delhi', country: 'India' }, to: { iata: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia' } },
  { from: { iata: 'LHR', name: 'Heathrow', city: 'London', country: 'United Kingdom' }, to: { iata: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan' } },
  { from: { iata: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France' }, to: { iata: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'Hong Kong' } },
];

export default function Search({ stats }) {
  const [form, setForm] = useState({ from: null, to: null, maxStops: '2' });
  const [state, setState] = useState('idle');
  const [results, setResults] = useState([]);

  function handleChange(partial) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  function handleSwap() {
    setForm((prev) => ({ ...prev, from: prev.to, to: prev.from }));
  }

  async function runSearch(activeForm = form) {
    if (!activeForm.from?.iata || !activeForm.to?.iata) return;
    setState('loading');
    try {
      const data = await api.connections(
        activeForm.from.iata,
        activeForm.to.iata,
        activeForm.maxStops
      );
      setResults(data);
      setState('done');
    } catch (err) {
      setResults(err.message);
      setState('error');
    }
  }

  function applyPopular(pair) {
    const next = { ...form, from: pair.from, to: pair.to };
    setForm(next);
    runSearch(next);
  }

  return (
    <>
      <section className="hero">
        <p className="hero-eyebrow">Flight booking made simple</p>
        <h1 className="hero-title">Find flights to your next destination</h1>
        <p className="hero-sub">
          Search by city, compare non-stop and connecting flights, and choose the route that works
          for you.
        </p>
      </section>

      <SearchCard
        from={form.from}
        to={form.to}
        maxStops={form.maxStops}
        onChange={handleChange}
        onSwap={handleSwap}
        onSubmit={() => runSearch()}
        loading={state === 'loading'}
      />

      <div className="popular-row">
        <span className="popular-label">Popular trips</span>
        {POPULAR.map((pair) => (
          <button
            key={`${pair.from.iata}-${pair.to.iata}`}
            type="button"
            className="popular-chip"
            onClick={() => applyPopular(pair)}
          >
            {pair.from.city} → {pair.to.city}
          </button>
        ))}
      </div>

      <div className="results-wrap">
        <RouteResults
          state={state}
          results={results}
          from={form.from?.iata}
          to={form.to?.iata}
          fromCity={form.from?.city}
          toCity={form.to?.city}
          onRetry={() => runSearch()}
        />
      </div>

      {state === 'idle' && <StatsGrid stats={stats} />}
    </>
  );
}
