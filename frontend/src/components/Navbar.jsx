import { NavLink } from 'react-router-dom';

export default function Navbar({ dbStatus }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand" end>
          Flight<span>X</span>
        </NavLink>
        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Flights
          </NavLink>
          <NavLink to="/airports" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Destinations
          </NavLink>
          <NavLink to="/data-model" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            About
          </NavLink>
        </nav>
        <div className="navbar-right">
          <span className={`status-pill${dbStatus === 'offline' ? ' offline' : ''}`}>
            <span className="status-dot" />
            {dbStatus === 'offline' ? 'Temporarily unavailable' : 'Ready to search'}
          </span>
        </div>
      </div>
    </header>
  );
}
