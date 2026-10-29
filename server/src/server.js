// Servidor para desarrollo local y Docker.
const app = require('./index');

const port = Number(process.env.PORT) || 4100;
const server = app.listen(port, () => console.log(`API en http://localhost:${port}`));

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
