import AirportPicker from './AirportPicker.jsx';

export default function SearchCard({
  from,
  to,
  maxStops,
  onChange,
  onSubmit,
  onSwap,
  loading,
}) {
  return (
    <div className="search-card">
      <div className="search-bar">
        <div className="search-pair">
          <div className="search-seg search-seg-from">
            <AirportPicker
              label="From"
              value={from}
              excludeIata={to?.iata}
              onSelect={(airport) => onChange({ from: airport })}
            />
          </div>

          <button
            type="button"
            className="swap-btn"
            onClick={onSwap}
            disabled={!from && !to}
            aria-label="Swap cities"
            title="Swap cities"
          >
            ⇄
          </button>

          <div className="search-seg search-seg-to">
            <AirportPicker
              label="To"
              value={to}
              excludeIata={from?.iata}
              onSelect={(airport) => onChange({ to: airport })}
            />
          </div>
        </div>

        <div className="search-seg search-seg-stops">
          <label htmlFor="stops-select">Stops</label>
          <select
            id="stops-select"
            value={maxStops}
            onChange={(e) => onChange({ maxStops: e.target.value })}
          >
            <option value="0">Non-stop only</option>
            <option value="1">Up to 1 stop</option>
            <option value="2">Up to 2 stops</option>
            <option value="3">Up to 3 stops</option>
          </select>
        </div>

        <button
          className="find-btn"
          type="button"
          onClick={onSubmit}
          disabled={loading || !from?.iata || !to?.iata}
        >
          {loading ? 'Searching…' : 'Search flights'}
        </button>
      </div>
    </div>
  );
}
