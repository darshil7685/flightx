import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';

export default function AirportPicker({ label, value, onSelect, excludeIata }) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);
  const reqId = useRef(0);

  useEffect(() => {
    function onDocClick(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    const term = query.trim();
    if (!open || term.length < 1) {
      setOptions([]);
      setLoading(false);
      return;
    }

    const id = ++reqId.current;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await api.searchAirports(term);
        if (id !== reqId.current) return;
        setOptions(results.filter((a) => a.iata !== excludeIata));
      } catch {
        if (id !== reqId.current) return;
        setOptions([]);
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query, open, excludeIata]);

  function handleFocus() {
    setOpen(true);
    if (value) setQuery(value.city);
  }

  function handleChange(e) {
    setQuery(e.target.value);
    setOpen(true);
    if (value) onSelect(null);
  }

  function choose(airport) {
    onSelect(airport);
    setQuery('');
    setOpen(false);
    setOptions([]);
  }

  const showDropdown = open && (loading || options.length > 0 || query.trim().length > 0);

  return (
    <div className="airport-picker" ref={wrapRef}>
      <label>{label}</label>
      <div className={`airport-input${value && !open ? ' has-selection' : ''}`}>
        {value && !open ? (
          <button type="button" className="airport-selected" onClick={handleFocus}>
            <span className="airport-selected-iata">{value.iata}</span>
            <span className="airport-selected-place">
              {value.city}, {value.country}
            </span>
          </button>
        ) : (
          <input
            value={query}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Enter city name"
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </div>

      {showDropdown && (
        <div className="airport-dropdown" role="listbox">
          {loading && options.length === 0 && (
            <div className="airport-option muted">Searching cities…</div>
          )}
          {!loading && query.trim().length > 0 && options.length === 0 && (
            <div className="airport-option muted">No matching cities found</div>
          )}
          {options.map((a) => (
            <button type="button" key={a.iata} className="airport-option" onClick={() => choose(a)}>
              <span className="airport-option-code">{a.iata}</span>
              <span className="airport-option-text">
                <span className="airport-option-city">
                  {a.city}, {a.country}
                </span>
                <span className="airport-option-name">{a.name}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
