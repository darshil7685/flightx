UNWIND $regionA AS a
UNWIND $regionB AS b
MATCH path = shortestPath((origin:Airport {iata: a})-[:FLIES_TO*1..4]->(dest:Airport {iata: b}))
WHERE origin.iata <> dest.iata
WITH nodes(path)[1..-1] AS intermediates
UNWIND intermediates AS bridge
RETURN bridge.iata AS iata, bridge.name AS name, count(*) AS timesOnPath
ORDER BY timesOnPath DESC
LIMIT 10;
