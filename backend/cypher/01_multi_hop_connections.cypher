// Every way to get from A to B, up to N stops, optionally restricted
// to one alliance. Path length is unknown ahead of time - *1..maxHops

MATCH path = (origin:Airport {iata: $from})-[:FLIES_TO*1..3]->(dest:Airport {iata: $to})
WITH path, relationships(path) AS legs
WHERE ($alliance IS NULL OR all(leg IN legs WHERE leg.alliance = $alliance))
WITH path, legs,
     reduce(km = 0, leg IN legs | km + leg.distanceKm) AS totalDistanceKm,
     [n IN nodes(path) | n.iata] AS stops
RETURN stops, size(legs) - 1 AS numStops, totalDistanceKm
ORDER BY totalDistanceKm ASC
LIMIT 15;
