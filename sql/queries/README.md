# Consultas analíticas

Cada archivo `.sql` es una consulta parametrizada (`$1`, `$2`, …) que la API ejecuta tal cual.
Todas parten de la vista `v_order_lines` (solo pedidos completados) y filtran por fecha con
`ordered_at >= $1 AND ordered_at < $2 + 1`. Así se aprovecha el índice parcial
`idx_orders_completed_date`.

| Archivo                    | Pregunta de negocio                                 | Técnicas SQL                                       |
| -------------------------- | --------------------------------------------------- | -------------------------------------------------- |
| `kpis.sql`                 | ¿Cómo vamos respecto al período anterior?           | CTEs, `UNION ALL`, `LEFT JOIN`, `NULLIF`           |
| `ventas_mensuales.sql`     | ¿Cuál es la tendencia mensual?                      | `generate_series`, `LAG`, promedio móvil con `ROWS` |
| `top_productos.sql`        | ¿Qué productos generan más ingresos? (Pareto)       | `RANK`, `SUM() OVER ()`, acumulado con ventana     |
| `ventas_por_categoria.sql` | ¿Qué categorías pesan más?                          | `SUM(SUM()) OVER ()`                               |
| `ventas_por_region.sql`    | ¿Dónde vendemos más y con qué ticket?               | Agregación + ventana, `COUNT(DISTINCT)`            |
| `cohortes.sql`             | ¿Los clientes vuelven a comprar?                    | Cohortes, `age()`, `FIRST_VALUE`, `WINDOW`         |
| `rango_fechas.sql`         | ¿Qué fechas cubren los datos?                       | `MIN`/`MAX`                                        |

Para probar una consulta directamente en `psql`:

```sql
PREPARE kpis(date, date) AS
  -- pega aquí el contenido de kpis.sql
;
EXECUTE kpis('2026-01-01', '2026-06-30');
```
