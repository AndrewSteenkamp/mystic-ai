// CJS wrapper — Node.js ESM can't require() natively,
// but esbuild __require handles this in the bundle.
module.exports = function loadSQLite() { return require("better-sqlite3"); };
