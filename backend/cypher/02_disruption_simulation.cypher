// Reachability before closure:
MATCH (origin:Airport)-[:FLIES_TO*1..2]->(dest:Airport)
WHERE origin.iata <> dest.iata
RETURN DISTINCT origin.iata AS origin, dest.iata AS dest;

// Reachability after removing $iata from every path:
MATCH (origin:Airport)-[legs:FLIES_TO*1..2]->(dest:Airport)
WHERE origin.iata <> dest.iata
  AND origin.iata <> $iata AND dest.iata <> $iata
  AND all(leg IN legs WHERE startNode(leg).iata <> $iata AND endNode(leg).iata <> $iata)
RETURN DISTINCT origin.iata AS origin, dest.iata AS dest;
