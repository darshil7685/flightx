const { runQuery, recordToObject } = require('../config/neo4j');

/**
 * Every way to get from A to B up to maxStops connections, optionally
 * restricted to a single alliance. This is the multi-hop traversal the
 * assignment asks for: depth is unknown ahead of time, so the path
 * length is bounded with *1..N rather than a fixed number of joins.
 */
async function findConnections({ from, to, maxStops = 2, alliance = null }) {
  const maxHops = Math.min(Number(maxStops) + 1, 4); // stops -> hops, capped for safety

  // Bind the path anonymously, then take relationships(path) as a list.
  // CognoDB treats a named var-length binding as a Path, so reduce()/size()
  // on that binding fail with "requires a list, got *types.Path".
  const cypher = `
    MATCH path = (origin:Airport {iata: $from})-[:FLIES_TO*1..${maxHops}]->(dest:Airport {iata: $to})
    WITH path, relationships(path) AS legs
    WHERE ($alliance IS NULL OR all(leg IN legs WHERE leg.alliance = $alliance))
    WITH path, legs,
         reduce(km = 0, leg IN legs | km + leg.distanceKm) AS totalDistanceKm,
         [n IN nodes(path) | n.iata] AS stops
    RETURN stops,
           size(legs) - 1 AS numStops,
           totalDistanceKm,
           [leg IN legs | { airlineName: leg.airlineName, airlineIata: leg.airlineIata, alliance: leg.alliance }] AS legs
    ORDER BY totalDistanceKm ASC
    LIMIT 15
  `;

  const records = await runQuery(cypher, { from, to, alliance });
  const routes = records.map(recordToObject);
  return enrichStopsWithPlaces(routes);
}

/** Attach city/country to each stop so the UI can show "DXB (Dubai, UAE)". */
async function enrichStopsWithPlaces(routes) {
  const codes = [
    ...new Set(routes.flatMap((route) => (Array.isArray(route.stops) ? route.stops : []))),
  ];
  if (codes.length === 0) return routes;

  const placeRecords = await runQuery(
    `
    MATCH (a:Airport)-[:LOCATED_IN]->(ci:City)-[:IN_COUNTRY]->(co:Country)
    WHERE a.iata IN $codes
    RETURN a.iata AS iata, ci.name AS city, co.name AS country
    `,
    { codes }
  );

  const places = Object.fromEntries(
    placeRecords.map(recordToObject).map((row) => [row.iata, row])
  );

  return routes.map((route) => ({
    ...route,
    stops: (route.stops || []).map((code) => ({
      iata: code,
      city: places[code]?.city || code,
      country: places[code]?.country || '',
    })),
  }));
}

/** Direct flights only, for the simple case. */
async function findDirectRoutes({ from, to }) {
  const records = await runQuery(
    `
    MATCH (origin:Airport {iata: $from})-[leg:FLIES_TO]->(dest:Airport {iata: $to})
    RETURN leg.airlineName AS airlineName, leg.airlineIata AS airlineIata,
           leg.alliance AS alliance, leg.distanceKm AS distanceKm,
           leg.equipment AS equipment
    ORDER BY leg.distanceKm ASC
    `,
    { from, to }
  );
  return records.map(recordToObject);
}

/** Shortest path by number of hops (not distance) - useful for "fewest stops". */
async function findShortestPath({ from, to }) {
  const records = await runQuery(
    `
    MATCH path = shortestPath(
      (origin:Airport {iata: $from})-[:FLIES_TO*1..6]->(dest:Airport {iata: $to})
    )
    RETURN [n IN nodes(path) | n.iata] AS stops, length(path) AS hops
    `,
    { from, to }
  );
  return records[0] ? recordToObject(records[0]) : null;
}

/** Every airport reachable from a given origin within N hops. */
async function getReachableAirports({ from, hops = 2 }) {
  const cappedHops = Math.min(Number(hops), 4);
  const records = await runQuery(
    `
    MATCH (origin:Airport {iata: $from})-[:FLIES_TO*1..${cappedHops}]->(dest:Airport)
    WHERE dest.iata <> $from
    RETURN DISTINCT dest.iata AS iata, dest.name AS name
    ORDER BY iata
    `,
    { from }
  );
  return records.map(recordToObject);
}

module.exports = {
  findConnections,
  findDirectRoutes,
  findShortestPath,
  getReachableAirports,
};
