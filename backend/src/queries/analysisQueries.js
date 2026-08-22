const { runQuery, recordToObject } = require('../config/neo4j');

/**
 * "If this airport closed today, which city pairs that were previously
 * reachable within maxHops become unreachable?" This requires computing
 * reachability twice - once on the full graph, once with one node
 * removed - and diffing the two sets. There is no clean relational
 * equivalent: it needs a recursive traversal run twice over a graph
 * with an unknown number of intermediate hops.
 */
async function simulateClosure({ iata, maxHops = 2 }) {
  const cappedHops = Math.min(Number(maxHops), 3);

  const beforeRecords = await runQuery(
    `
    MATCH (origin:Airport)-[:FLIES_TO*1..${cappedHops}]->(dest:Airport)
    WHERE origin.iata <> dest.iata
    RETURN DISTINCT origin.iata AS origin, dest.iata AS dest
    `
  );

  const afterRecords = await runQuery(
    `
    MATCH (origin:Airport)-[legs:FLIES_TO*1..${cappedHops}]->(dest:Airport)
    WHERE origin.iata <> dest.iata
      AND origin.iata <> $iata
      AND dest.iata <> $iata
      AND all(leg IN legs WHERE startNode(leg).iata <> $iata AND endNode(leg).iata <> $iata)
    RETURN DISTINCT origin.iata AS origin, dest.iata AS dest
    `,
    { iata }
  );

  const beforeSet = new Set(beforeRecords.map((r) => `${r.get('origin')}->${r.get('dest')}`));
  const afterSet = new Set(afterRecords.map((r) => `${r.get('origin')}->${r.get('dest')}`));

  const newlyUnreachable = [...beforeSet]
    .filter((pair) => !afterSet.has(pair))
    .map((pair) => {
      const [origin, dest] = pair.split('->');
      return { origin, dest };
    });

  return {
    closedAirport: iata,
    pairsBefore: beforeSet.size,
    pairsAfter: afterSet.size,
    newlyUnreachable,
  };
}

/**
 * Finds airports that sit on a disproportionate share of the shortest
 * paths between two groups of airports - i.e. chokepoints. Ranking by
 * "how often does this node appear as the only bridge" is a graph
 * centrality question, not something a join can express.
 */
async function findBottlenecks({ regionAIatas, regionBIatas, maxHops = 3 }) {
  const cappedHops = Math.min(Number(maxHops), 4);

  const records = await runQuery(
    `
    UNWIND $regionA AS a
    UNWIND $regionB AS b
    MATCH path = shortestPath(
      (origin:Airport {iata: a})-[:FLIES_TO*1..${cappedHops}]->(dest:Airport {iata: b})
    )
    WHERE origin.iata <> dest.iata
    WITH nodes(path)[1..-1] AS intermediates
    UNWIND intermediates AS bridge
    RETURN bridge.iata AS iata, bridge.name AS name, count(*) AS timesOnPath
    ORDER BY timesOnPath DESC
    LIMIT 10
    `,
    { regionA: regionAIatas, regionB: regionBIatas }
  );
  return records.map(recordToObject);
}

module.exports = { simulateClosure, findBottlenecks };
