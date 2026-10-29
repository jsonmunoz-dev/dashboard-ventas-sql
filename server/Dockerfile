# Se construye desde la raíz del repo (contexto ".") para incluir sql/queries.
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production SQL_DIR=/app/sql/queries
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev
COPY server/src ./server/src
COPY sql/queries ./sql/queries
USER node
EXPOSE 4100
CMD ["node", "server/src/server.js"]
