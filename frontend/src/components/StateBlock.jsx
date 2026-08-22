export function LoadingState({ rows = 3 }) {
  return (
    <div className="results-loading">
      <p className="results-loading-label">Finding the best flights for you…</p>
      {Array.from({ length: rows }).map((_, i) => (
        <div className="skeleton" key={i} />
      ))}
    </div>
  );
}

export function EmptyState({ title, body }) {
  return (
    <div className="state-block">
      <div className="state-title">{title}</div>
      <div className="state-body">{body}</div>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  const isOffline = message === 'offline';
  return (
    <div className="state-block error">
      <div className="state-title">
        {isOffline ? "We can't reach FlightX right now" : "Couldn't complete your search"}
      </div>
      <div className="state-body">
        {isOffline
          ? 'Please try again in a moment. Your search details are still here.'
          : 'Something went wrong while looking up flights. Please try again.'}
      </div>
      {onRetry && (
        <button className="secondary-btn" type="button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
