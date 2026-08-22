const { runQuery, recordToObject } = require('../config/neo4j');

/** Autocomplete search by city, airport name, or IATA code. */
async function searchAirports(term) {
  const records = await runQuery(
    `
    MATCH (a:Airport)-[:LOCATED_IN]->(ci:City)-[:IN_COUNTRY]->(co:Country)
    WHERE toLower(ci.name) CONTAINS toLower($term)
       OR toLower(a.name) CONTAINS toLower($term)
       OR toLower(a.iata) STARTS WITH toLower($term)
    RETURN a.iata AS iata, a.name AS name, ci.name AS city, co.name AS country
    ORDER BY
      CASE WHEN toLower(ci.name) STARTS WITH toLower($term) THEN 0
           WHEN toLower(a.iata) = toLower($term) THEN 1
           ELSE 2 END,
      ci.name, a.iata
    LIMIT 8
    `,
    { term }
  );
  return records.map(recordToObject);
}

/** Full profile for one airport: location, direct destinations, airlines serving it. */
async function getAirportDetail(iata) {
  const records = await runQuery(
    `
    MATCH (a:Airport {iata: $iata})-[:LOCATED_IN]->(ci:City)-[:IN_COUNTRY]->(co:Country)
    OPTIONAL MATCH (a)-[r:FLIES_TO]->(dest:Airport)
    WITH a, ci, co, count(DISTINCT dest) AS destinationCount,
         count(r) AS routeCount, collect(DISTINCT r.airlineName) AS airlines
    RETURN a.iata AS iata, a.name AS name, ci.name AS city, co.name AS country,
           destinationCount, routeCount, airlines
    `,
    { iata }
  );
  return records[0] ? recordToObject(records[0]) : null;
}

/** Global counts shown on the homepage stat strip. */
async function getNetworkStats() {
  const records = await runQuery(`
    MATCH (a:Airport) WITH count(a) AS airports
    MATCH ()-[r:FLIES_TO]->() WITH airports, count(r) AS routes,
         count(DISTINCT r.airlineIata) AS carriers
    RETURN airports, routes, carriers
  `);
  return recordToObject(records[0]);
}

module.exports = { searchAirports, getAirportDetail, getNetworkStats };
