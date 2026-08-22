import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Search from './pages/Search.jsx';
import Airports from './pages/Airports.jsx';
import DataModel from './pages/DataModel.jsx';
import { api } from './api/client.js';

export default function App() {
  const [dbStatus, setDbStatus] = useState('checking');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function check() {
      try {
        await api.health();
        setDbStatus('online');
        const s = await api.stats();
        setStats(s);
      } catch {
        setDbStatus('offline');
      }
    }
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-shell">
      <Navbar dbStatus={dbStatus} />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Search stats={stats} />} />
          <Route path="/airports" element={<Airports />} />
          <Route path="/data-model" element={<DataModel />} />
        </Routes>
      </main>
    </div>
  );
}
