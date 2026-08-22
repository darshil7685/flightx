import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('FlightX UI error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="state-block error" style={{ margin: '40px 24px' }}>
          <div className="state-title">Something went wrong on this page</div>
          <div className="state-body">Refresh the page to continue using FlightX.</div>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
