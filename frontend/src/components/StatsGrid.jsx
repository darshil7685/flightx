import { asNumber } from '../api/safe.js';

export default function StatsGrid({ stats }) {
  if (!stats) return null;
  const items = [
    { value: asNumber(stats.airports), label: 'Cities & airports' },
    { value: asNumber(stats.routes), label: 'Flight options' },
    { value: asNumber(stats.carriers), label: 'Airlines' },
    { value: '3', label: 'Stops supported' },
  ];
  return (
    <section className="stats-section">
      <h2 className="section-title">Why travellers choose FlightX</h2>
      <p className="section-sub">
        Compare direct flights and connecting options in one search — no jargon, just clear routes.
      </p>
      <div className="stats-grid">
        {items.map((item) => (
          <div className="stat-card" key={item.label}>
            <div className="stat-value">{item.value}</div>
            <div className="stat-label">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
