# SQL

Se ejecutan en orden:

1. `01_schema.sql`: tablas, restricciones e índices.
2. `02_seed.sql`: datos de ejemplo generados con `generate_series` y `random()`. Usa `setseed`, así que los datos son siempre los mismos.
3. `03_views.sql`: vista `v_order_lines`, base de todas las consultas.

```bash
psql "$DATABASE_URL" -f 01_schema.sql -f 02_seed.sql -f 03_views.sql
```

Las consultas del dashboard están en [`queries/`](queries/).
