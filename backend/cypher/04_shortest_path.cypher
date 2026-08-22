// Fewest-hop route between two airports, ignoring alliance and distance.
MATCH path = shortestPath(
  (origin:Airport {iata: $from})-[:FLIES_TO*1..6]->(dest:Airport {iata: $to})
)
RETURN [n IN nodes(path) | n.iata] AS stops, length(path) AS hops;
