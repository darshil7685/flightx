require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { verifyConnectivity } = require('./config/neo4j');
const { searchAirports, getAirportDetail, getNetworkStats } = require('./queries/airportQueries');
const {
  findConnections,
  findDirectRoutes,
  findShortestPath,
  getReachableAirports,
} = require('./queries/routeQueries');
const { simulateClosure, findBottlenecks } = require('./queries/analysisQueries');

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
  })
);

// Wraps a route handler so any thrown error (including a dead DB
// connection) turns into a clean JSON error instead of a hang or a
// stack trace leaking to the client.
function safe(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      const isConnectionIssue = /connect|ECONNREFUSED|Unable to retrieve|ServiceUnavailable/i.test(
        err.message || ''
      );
      res.status(isConnectionIssue ? 503 : 500).json({
        error: isConnectionIssue
          ? 'The graph database is unreachable right now. Please try again in a moment.'
          : 'Something went wrong processing that request.',
        detail: err.message,
      });
    }
  };
}

app.get(
  '/api/health',
  safe(async (req, res) => {
    await verifyConnectivity();
    res.json({ status: 'ok', database: 'connected' });
  })
);

app.get(
  '/api/stats',
  safe(async (req, res) => {
    res.json(await getNetworkStats());
  })
);

app.get(
  '/api/airports/search',
  safe(async (req, res) => {
    const term = String(req.query.q || '');
    if (term.trim().length < 1) return res.json([]);
    res.json(await searchAirports(term.trim()));
  })
);

app.get(
  '/api/airports/:iata',
  safe(async (req, res) => {
    const detail = await getAirportDetail(req.params.iata.toUpperCase());
    if (!detail) return res.status(404).json({ error: 'Airport not found.' });
    res.json(detail);
  })
);

app.get(
  '/api/airports/:iata/reachable',
  safe(async (req, res) => {
    const result = await getReachableAirports({
      from: req.params.iata.toUpperCase(),
      hops: req.query.hops,
    });
    res.json(result);
  })
);

app.get(
  '/api/routes/direct',
  safe(async (req, res) => {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ error: 'from and to are required.' });
    res.json(await findDirectRoutes({ from: from.toUpperCase(), to: to.toUpperCase() }));
  })
);

app.get(
  '/api/routes/connections',
  safe(async (req, res) => {
    const { from, to, maxStops, alliance } = req.query;
    if (!from || !to) return res.status(400).json({ error: 'from and to are required.' });
    const result = await findConnections({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      maxStops: maxStops || 2,
      alliance: alliance && alliance !== 'any' ? alliance : null,
    });
    res.json(result);
  })
);

app.get(
  '/api/routes/shortest',
  safe(async (req, res) => {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ error: 'from and to are required.' });
    const result = await findShortestPath({ from: from.toUpperCase(), to: to.toUpperCase() });
    if (!result) return res.status(404).json({ error: 'No path found within 6 hops.' });
    res.json(result);
  })
);

app.post(
  '/api/simulate/closure',
  safe(async (req, res) => {
    const { iata, maxHops } = req.body;
    if (!iata) return res.status(400).json({ error: 'iata is required.' });
    res.json(await simulateClosure({ iata: iata.toUpperCase(), maxHops: maxHops || 2 }));
  })
);

app.get(
  '/api/analysis/bottlenecks',
  safe(async (req, res) => {
    const { regionA, regionB, maxHops } = req.query;
    if (!regionA || !regionB) {
      return res.status(400).json({ error: 'regionA and regionB are required (comma-separated IATA codes).' });
    }
    const result = await findBottlenecks({
      regionAIatas: regionA.split(',').map((s) => s.trim().toUpperCase()),
      regionBIatas: regionB.split(',').map((s) => s.trim().toUpperCase()),
      maxHops: maxHops || 3,
    });
    res.json(result);
  })
);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`FlightX API listening`);
});
