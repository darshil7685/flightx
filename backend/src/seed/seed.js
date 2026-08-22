require('dotenv').config();
const { getDriver, closeDriver } = require('../config/neo4j');

// ---------------------------------------------------------------------
// Static seed data. Real IATA codes and coordinates, hand-curated so the
// app can be demoed without any network dependency in this script.
// ---------------------------------------------------------------------

const AIRPORTS = [
  { iata: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'United States', lat: 40.6413, lon: -73.7781 },
  { iata: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'United States', lat: 33.9416, lon: -118.4085 },
  { iata: 'ORD', name: "O'Hare International", city: 'Chicago', country: 'United States', lat: 41.9742, lon: -87.9073 },
  { iata: 'ATL', name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', country: 'United States', lat: 33.6407, lon: -84.4277 },
  { iata: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'United States', lat: 37.6213, lon: -122.3790 },
  { iata: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'United States', lat: 47.4502, lon: -122.3088 },
  { iata: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'United States', lat: 32.8998, lon: -97.0403 },
  { iata: 'MIA', name: 'Miami International', city: 'Miami', country: 'United States', lat: 25.7959, lon: -80.2870 },
  { iata: 'BOS', name: 'Logan International', city: 'Boston', country: 'United States', lat: 42.3656, lon: -71.0096 },
  { iata: 'DEN', name: 'Denver International', city: 'Denver', country: 'United States', lat: 39.8561, lon: -104.6737 },
  { iata: 'YYZ', name: 'Toronto Pearson International', city: 'Toronto', country: 'Canada', lat: 43.6777, lon: -79.6248 },
  { iata: 'LHR', name: 'Heathrow', city: 'London', country: 'United Kingdom', lat: 51.4700, lon: -0.4543 },
  { iata: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', lat: 49.0097, lon: 2.5479 },
  { iata: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', lat: 50.0379, lon: 8.5622 },
  { iata: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', lat: 52.3105, lon: 4.7683 },
  { iata: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Spain', lat: 40.4936, lon: -3.5668 },
  { iata: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', lat: 47.4647, lon: 8.5492 },
  { iata: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', lat: 41.2753, lon: 28.7519 },
  { iata: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', lat: 48.3538, lon: 11.7861 },
  { iata: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland', lat: 53.4213, lon: -6.2701 },
  { iata: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE', lat: 25.2532, lon: 55.3657 },
  { iata: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar', lat: 25.2609, lon: 51.6138 },
  { iata: 'DEL', name: 'Indira Gandhi International', city: 'New Delhi', country: 'India', lat: 28.5562, lon: 77.1000 },
  { iata: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', city: 'Mumbai', country: 'India', lat: 19.0896, lon: 72.8656 },
  { iata: 'BLR', name: 'Kempegowda International', city: 'Bengaluru', country: 'India', lat: 13.1986, lon: 77.7066 },
  { iata: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore', lat: 1.3644, lon: 103.9915 },
  { iata: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'Hong Kong', lat: 22.3080, lon: 113.9185 },
  { iata: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan', lat: 35.7720, lon: 140.3929 },
  { iata: 'ICN', name: 'Incheon International', city: 'Seoul', country: 'South Korea', lat: 37.4602, lon: 126.4407 },
  { iata: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia', lat: -33.9399, lon: 151.1753 },
];

const AIRLINES = [
  { iata: 'AA', name: 'American Airlines', alliance: 'Oneworld' },
  { iata: 'UA', name: 'United Airlines', alliance: 'Star Alliance' },
  { iata: 'DL', name: 'Delta Air Lines', alliance: 'SkyTeam' },
  { iata: 'BA', name: 'British Airways', alliance: 'Oneworld' },
  { iata: 'AF', name: 'Air France', alliance: 'SkyTeam' },
  { iata: 'LH', name: 'Lufthansa', alliance: 'Star Alliance' },
  { iata: 'IB', name: 'Iberia', alliance: 'Oneworld' },
  { iata: 'KL', name: 'KLM', alliance: 'SkyTeam' },
  { iata: 'LX', name: 'Swiss International Air Lines', alliance: 'Star Alliance' },
  { iata: 'TK', name: 'Turkish Airlines', alliance: 'Star Alliance' },
  { iata: 'AC', name: 'Air Canada', alliance: 'Star Alliance' },
  { iata: 'EK', name: 'Emirates', alliance: null },
  { iata: 'QR', name: 'Qatar Airways', alliance: 'Oneworld' },
  { iata: 'SQ', name: 'Singapore Airlines', alliance: 'Star Alliance' },
  { iata: 'CX', name: 'Cathay Pacific', alliance: 'Oneworld' },
  { iata: 'NH', name: 'All Nippon Airways', alliance: 'Star Alliance' },
  { iata: 'KE', name: 'Korean Air', alliance: 'SkyTeam' },
  { iata: 'QF', name: 'Qantas', alliance: 'Oneworld' },
  { iata: 'AI', name: 'Air India', alliance: 'Star Alliance' },
];

// One entry per direct flight *pair* - both directions are generated
// below, so this list defines roughly half of the final relationship
// count. Kept short and hand-picked on purpose: enough to demonstrate
// multi-hop routing, disruption analysis and bottleneck detection
// without needing more than a couple hundred FLIES_TO relationships.
const ROUTE_PAIRS = [
  // US domestic
  ['JFK', 'LAX', 'AA'], ['JFK', 'ORD', 'UA'], ['JFK', 'ATL', 'DL'],
  ['JFK', 'SFO', 'DL'], ['JFK', 'MIA', 'AA'], ['JFK', 'BOS', 'DL'],
  ['LAX', 'SFO', 'UA'], ['LAX', 'SEA', 'AA'], ['LAX', 'DFW', 'AA'],
  ['LAX', 'ORD', 'UA'], ['ORD', 'ATL', 'DL'], ['ORD', 'DFW', 'AA'],
  ['ORD', 'DEN', 'UA'], ['ATL', 'MIA', 'DL'], ['ATL', 'DFW', 'DL'],
  ['DFW', 'DEN', 'AA'], ['DFW', 'MIA', 'AA'], ['SEA', 'DEN', 'UA'],
  ['BOS', 'DEN', 'UA'], ['MIA', 'BOS', 'AA'], ['JFK', 'YYZ', 'AC'],

  // Transatlantic
  ['JFK', 'LHR', 'BA'], ['JFK', 'CDG', 'AF'], ['JFK', 'FRA', 'LH'],
  ['JFK', 'MAD', 'IB'], ['ATL', 'CDG', 'DL'], ['ATL', 'AMS', 'DL'],
  ['ORD', 'LHR', 'UA'], ['ORD', 'FRA', 'UA'], ['DFW', 'LHR', 'AA'],
  ['MIA', 'MAD', 'IB'], ['BOS', 'LHR', 'BA'], ['SFO', 'LHR', 'BA'],
  ['LAX', 'LHR', 'BA'], ['DEN', 'FRA', 'LH'], ['YYZ', 'LHR', 'AC'],

  // Within Europe
  ['LHR', 'CDG', 'BA'], ['LHR', 'FRA', 'LH'], ['LHR', 'AMS', 'BA'],
  ['LHR', 'MAD', 'IB'], ['LHR', 'ZRH', 'LX'], ['LHR', 'DUB', 'BA'],
  ['LHR', 'MUC', 'LH'], ['LHR', 'IST', 'TK'], ['CDG', 'FRA', 'AF'],
  ['CDG', 'AMS', 'AF'], ['CDG', 'MAD', 'AF'], ['CDG', 'ZRH', 'LX'],
  ['FRA', 'AMS', 'LH'], ['FRA', 'ZRH', 'LX'], ['FRA', 'MUC', 'LH'],
  ['FRA', 'IST', 'TK'], ['FRA', 'MAD', 'LH'], ['AMS', 'MAD', 'KL'],
  ['AMS', 'ZRH', 'KL'], ['MAD', 'ZRH', 'LX'], ['DUB', 'CDG', 'AF'],
  ['DUB', 'AMS', 'KL'], ['MUC', 'ZRH', 'LX'], ['IST', 'MUC', 'TK'],

  // Europe <-> Middle East
  ['LHR', 'DXB', 'EK'], ['LHR', 'DOH', 'QR'], ['CDG', 'DXB', 'EK'],
  ['FRA', 'DXB', 'EK'], ['AMS', 'DXB', 'EK'], ['MAD', 'DXB', 'EK'],
  ['ZRH', 'DXB', 'EK'], ['IST', 'DXB', 'TK'], ['FRA', 'DOH', 'QR'],
  ['CDG', 'DOH', 'QR'], ['MUC', 'DXB', 'EK'],

  // Middle East <-> South Asia
  ['DXB', 'DEL', 'EK'], ['DXB', 'BOM', 'EK'], ['DXB', 'BLR', 'EK'],
  ['DXB', 'SIN', 'EK'], ['DXB', 'HKG', 'EK'], ['DXB', 'NRT', 'EK'],
  ['DXB', 'ICN', 'EK'], ['DOH', 'DEL', 'QR'], ['DOH', 'BOM', 'QR'],
  ['DOH', 'BLR', 'QR'], ['DOH', 'SIN', 'QR'], ['DOH', 'HKG', 'QR'],

  // East Asia / Pacific hub network
  ['SIN', 'HKG', 'SQ'], ['SIN', 'NRT', 'SQ'], ['SIN', 'ICN', 'SQ'],
  ['SIN', 'SYD', 'SQ'], ['HKG', 'NRT', 'CX'], ['HKG', 'ICN', 'CX'],
  ['HKG', 'SYD', 'CX'], ['NRT', 'ICN', 'NH'], ['NRT', 'SYD', 'NH'],
  ['ICN', 'SYD', 'KE'],

  // Asia <-> US
  ['SIN', 'LAX', 'SQ'], ['HKG', 'LAX', 'CX'], ['NRT', 'LAX', 'NH'],
  ['NRT', 'JFK', 'NH'], ['NRT', 'SFO', 'NH'], ['ICN', 'LAX', 'KE'],
  ['ICN', 'JFK', 'KE'], ['SIN', 'SFO', 'SQ'], ['HKG', 'SFO', 'CX'],
  ['SYD', 'LAX', 'QF'], ['SYD', 'SFO', 'QF'],

  // India <-> East Asia
  ['DEL', 'SIN', 'AI'], ['DEL', 'HKG', 'AI'], ['BOM', 'SIN', 'AI'],
  ['BLR', 'SIN', 'AI'],
];

// ------------------------------- helpers -------------------------------
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function buildDirectedEdges() {
  const airportByIata = new Map(AIRPORTS.map((a) => [a.iata, a]));
  const airlineByIata = new Map(AIRLINES.map((a) => [a.iata, a]));
  const edges = [];

  for (const [from, to, airlineIata] of ROUTE_PAIRS) {
    const a = airportByIata.get(from);
    const b = airportByIata.get(to);
    const airline = airlineByIata.get(airlineIata);
    if (!a || !b || !airline) {
      throw new Error(`Seed data error: unknown airport or airline in pair [${from}, ${to}, ${airlineIata}]`);
    }
    const distanceKm = haversineKm(a.lat, a.lon, b.lat, b.lon);
    const alliance = airline.alliance || 'none';

    // one direction...
    edges.push({ from, to, airlineIata, airlineName: airline.name, alliance, distanceKm });
    // ...and the return flight
    edges.push({ from: to, to: from, airlineIata, airlineName: airline.name, alliance, distanceKm });
  }
  return edges;
}

// ------------------------------- loading -------------------------------
async function runConstraints(session) {
  const statements = [
    'CREATE CONSTRAINT airport_iata IF NOT EXISTS FOR (a:Airport) REQUIRE a.iata IS UNIQUE',
    'CREATE CONSTRAINT airline_iata IF NOT EXISTS FOR (a:Airline) REQUIRE a.iata IS UNIQUE',
    'CREATE CONSTRAINT city_key IF NOT EXISTS FOR (c:City) REQUIRE c.key IS UNIQUE',
    'CREATE CONSTRAINT country_name IF NOT EXISTS FOR (c:Country) REQUIRE c.name IS UNIQUE',
    'CREATE CONSTRAINT alliance_name IF NOT EXISTS FOR (a:Alliance) REQUIRE a.name IS UNIQUE',
  ];
  for (const stmt of statements) {
    await session.run(stmt);
  }
}

async function seed() {
  const edges = buildDirectedEdges();
  console.log(`Static seed data: ${AIRPORTS.length} airports, ${AIRLINES.length} airlines, ${edges.length} flight relationships.`);

  const driver = getDriver();
  const session = driver.session();

  try {
    console.log('Verifying connectivity to CognoDB...');
    await driver.verifyConnectivity();

    console.log('Applying uniqueness constraints...');
    await runConstraints(session);

    console.log('Clearing any existing seed data...');
    await session.run('MATCH (n) DETACH DELETE n');

    console.log('Loading countries, cities and airports...');
    await session.run(
      `
      UNWIND $rows AS row
      MERGE (co:Country {name: row.country})
      MERGE (ci:City {key: row.city + '|' + row.country})
      ON CREATE SET ci.name = row.city
      MERGE (ci)-[:IN_COUNTRY]->(co)
      MERGE (a:Airport {iata: row.iata})
      ON CREATE SET a.name = row.name, a.lat = row.lat, a.lon = row.lon
      MERGE (a)-[:LOCATED_IN]->(ci)
      `,
      { rows: AIRPORTS }
    );

    console.log('Loading alliances and airlines...');
    const alliances = ['Star Alliance', 'SkyTeam', 'Oneworld'];
    await session.run(`UNWIND $names AS name MERGE (:Alliance {name: name})`, { names: alliances });

    await session.run(
      `
      UNWIND $rows AS row
      MERGE (al:Airline {iata: row.iata})
      ON CREATE SET al.name = row.name
      WITH al, row
      WHERE row.alliance IS NOT NULL
      MATCH (alliance:Alliance {name: row.alliance})
      MERGE (al)-[:MEMBER_OF]->(alliance)
      `,
      { rows: AIRLINES }
    );

    console.log('Loading flight routes...');
    await session.run(
      `
      UNWIND $rows AS row
      MATCH (from:Airport {iata: row.from})
      MATCH (to:Airport {iata: row.to})
      MERGE (from)-[r:FLIES_TO {airlineIata: row.airlineIata}]->(to)
      ON CREATE SET
        r.airlineName = row.airlineName,
        r.alliance = row.alliance,
        r.distanceKm = row.distanceKm
      `,
      { rows: edges }
    );

    const stats = await session.run(`
      MATCH (a:Airport) WITH count(a) AS airports
      MATCH ()-[r:FLIES_TO]->() WITH airports, count(r) AS routes
      MATCH (al:Airline) WITH airports, routes, count(al) AS airlines
      RETURN airports, routes, airlines
    `);
    const row = stats.records[0];
    console.log('Seed complete:');
    console.log(`  Airports: ${row.get('airports')}`);
    console.log(`  Routes:   ${row.get('routes')}`);
    console.log(`  Airlines: ${row.get('airlines')}`);
  } finally {
    await session.close();
    await closeDriver();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
