const { Pool, types } = require('pg');

// pg devuelve NUMERIC y BIGINT como string para no perder precisión.
// Los montos en CLP y los conteos de este proyecto caben de sobra en un Number.
types.setTypeParser(types.builtins.NUMERIC, (v) => (v === null ? null : Number(v)));
types.setTypeParser(types.builtins.INT8, (v) => (v === null ? null : Number(v)));

function createPool(databaseUrl) {
  return new Pool({ connectionString: databaseUrl });
}

module.exports = { createPool };
