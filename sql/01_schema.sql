-- =============================================================
-- Esquema de ventas (modelo transaccional simple)
-- =============================================================
DROP VIEW IF EXISTS v_order_lines;
DROP TABLE IF EXISTS order_items, orders, customers, products, categories, regions CASCADE;

CREATE TABLE regions (
  id   SMALLSERIAL PRIMARY KEY,
  name VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE categories (
  id   SMALLSERIAL PRIMARY KEY,
  name VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(120)   NOT NULL UNIQUE,
  category_id SMALLINT       NOT NULL REFERENCES categories (id),
  unit_price  NUMERIC(12, 0) NOT NULL CHECK (unit_price > 0), -- CLP, sin decimales
  -- Peso relativo usado solo por el generador de datos (productos más vendidos).
  popularity  NUMERIC(4, 2)  NOT NULL DEFAULT 1
);

CREATE TABLE customers (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  region_id  SMALLINT     NOT NULL REFERENCES regions (id)
);

CREATE TABLE orders (
  id          SERIAL PRIMARY KEY,
  customer_id INTEGER     NOT NULL REFERENCES customers (id),
  ordered_at  TIMESTAMP   NOT NULL,
  status      VARCHAR(10) NOT NULL CHECK (status IN ('completed', 'cancelled'))
);

CREATE TABLE order_items (
  order_id   INTEGER        NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id INTEGER        NOT NULL REFERENCES products (id),
  quantity   INTEGER        NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 0) NOT NULL CHECK (unit_price > 0), -- precio al momento de la venta
  PRIMARY KEY (order_id, product_id)
);

-- Índice parcial: casi todas las consultas analíticas filtran pedidos completados por fecha.
CREATE INDEX idx_orders_completed_date ON orders (ordered_at) WHERE status = 'completed';
CREATE INDEX idx_orders_customer ON orders (customer_id);
CREATE INDEX idx_order_items_product ON order_items (product_id);
