import { LoadingState, EmptyState, ErrorState } from './StateBlock.jsx';
import { asNumber } from '../api/safe.js';

function stopLabel(numStops) {
  const n = asNumber(numStops);
  if (n === 0) return 'Non-stop';
  if (n === 1) return '1 stop';
  return `${n} stops`;
}

function stopCode(stop) {
  return typeof stop === 'string' ? stop : stop?.iata || '';
}

function formatViaStop(stop) {
  if (!stop) return '';
  if (typeof stop === 'string') return stop;
  const place = [stop.city, stop.country].filter(Boolean).join(', ');
  return place ? `${stop.iata} (${place})` : stop.iata;
}

export default function RouteResults({ state, results, from, to, fromCity, toCity, onRetry }) {
  if (state === 'idle') {
    return (
      <EmptyState
        title="Ready when you are"
        body="Enter your departure and arrival cities above, then search to see available flights and connections."
      />
    );
  }

  if (state === 'loading') return <LoadingState rows={3} />;
  if (state === 'error') return <ErrorState message={results} onRetry={onRetry} />;

  if (state === 'done' && results.length === 0) {
    return (
      <EmptyState
        title={`No flights found from ${fromCity || from} to ${toCity || to}`}
        body="Try allowing more stops and search again."
      />
    );
  }

  const hasDirect = results.some((r) => asNumber(r.numStops) === 0);

  return (
    <section className="results-section">
      <div className="results-header">
        <div>
          <h2 className="results-heading">
            {fromCity || from} → {toCity || to}
          </h2>
          <p className="results-count">
            {results.length} flight{results.length === 1 ? '' : 's'} found
            {!hasDirect ? ' · Connecting flights only' : ''}
          </p>
        </div>
      </div>

      <div className="flight-list">
        {results.map((route, i) => {
          const stops = Array.isArray(route.stops) ? route.stops : [];
          const legs = Array.isArray(route.legs) ? route.legs : [];
          const numStops = asNumber(route.numStops);
          const distance = asNumber(route.totalDistanceKm);
          const viaStops = stops.slice(1, -1);

          return (
            <article className="flight-card" key={i}>
              <div className="flight-card-main">
                <div className="flight-route">
                  <div className="flight-endpoint">
                    <span className="flight-code">{stopCode(stops[0])}</span>
                    <span className="flight-city-hint">Depart</span>
                  </div>
                  <div className="flight-mid">
                    <span className="flight-stops">{stopLabel(numStops)}</span>
                    <div className="flight-line" aria-hidden="true">
                      <span className="flight-dot" />
                      <span className="flight-rail" />
                      <span className="flight-dot" />
                    </div>
                    <span className="flight-distance">{distance.toLocaleString()} km</span>
                  </div>
                  <div className="flight-endpoint end">
                    <span className="flight-code">{stopCode(stops[stops.length - 1])}</span>
                    <span className="flight-city-hint">Arrive</span>
                  </div>
                </div>

                {numStops > 0 && viaStops.length > 0 && (
                  <p className="flight-via">
                    Via {viaStops.map(formatViaStop).join(' · ')}
                  </p>
                )}

                <div className="airline-chips">
                  {legs.map((leg, j) => (
                    <span className="airline-chip" key={j}>
                      {leg.airlineName}
                    </span>
                  ))}
                  {legs[0]?.alliance && legs[0].alliance !== 'none' && (
                    <span className="alliance-badge">{legs[0].alliance}</span>
                  )}
                </div>
              </div>
              <div className="flight-card-aside">
                <span className="flight-badge">{stopLabel(numStops)}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
