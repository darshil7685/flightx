const neo4j = require('neo4j-driver');

let driver = null;

function getDriver() {
  if (driver) return driver;

  const uri = process.env.COGNODB_URI;
  const user = process.env.COGNODB_USER;
  const password = process.env.COGNODB_PASSWORD;

  if (!uri || !user || !password) {
    throw new Error(
      'Missing CognoDB connection details. Set COGNODB_URI, COGNODB_USER and COGNODB_PASSWORD in your .env file.'
    );
  }

  driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    maxConnectionPoolSize: 20,
  });

  return driver;
}

/**
 * Confirms the database is reachable. Used by /api/health and by
 * routes that need to fail gracefully instead of hanging.
 */
async function verifyConnectivity() {
  const d = getDriver();
  await d.verifyConnectivity();
}

async function closeDriver() {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

function toNative(value) {
  if (value == null) return value;
  if (neo4j.isInt(value)) return value.toNumber();
  if (Array.isArray(value)) return value.map(toNative);
  if (typeof value === 'object') {
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = toNative(nested);
    }
    return out;
  }
  return value;
}

function recordToObject(record) {
  return toNative(record.toObject());
}

/**
 * Runs a single Cypher statement in a managed session and returns
 * the raw records. All callers pass params - never string-concatenated
 * Cypher.
 */
async function runQuery(cypher, params = {}) {
  const d = getDriver();
  const session = d.session();
  try {
    const result = await session.run(cypher, params);
    return result.records;
  } finally {
    await session.close();
  }
}

module.exports = {
  getDriver,
  verifyConnectivity,
  closeDriver,
  runQuery,
  toNative,
  recordToObject,
};
