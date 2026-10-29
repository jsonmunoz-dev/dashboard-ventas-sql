const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_SQL_DIR = path.resolve(__dirname, '../../sql/queries');

// Carga cada archivo .sql de la carpeta como { nombre: textoSQL }.
// Las consultas viven en archivos .sql (y no como strings en JS) para poder
// leerlas, revisarlas y ejecutarlas directamente en psql.
function loadQueries(dir = process.env.SQL_DIR || DEFAULT_SQL_DIR) {
  return Object.fromEntries(
    fs
      .readdirSync(dir)
      .filter((file) => file.endsWith('.sql'))
      .map((file) => [path.basename(file, '.sql'), fs.readFileSync(path.join(dir, file), 'utf8')]),
  );
}

module.exports = { loadQueries, DEFAULT_SQL_DIR };
