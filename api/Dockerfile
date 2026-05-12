FROM node:20-alpine AS builder
# cache bust: v2
WORKDIR /app
COPY shared/ ./shared/
COPY api/package*.json ./api/
COPY api/tsconfig*.json ./api/
RUN cd api && npm install && \
    cp -r node_modules /app/node_modules 2>/dev/null || true
COPY api/ ./api/
WORKDIR /app/api
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY shared/ ./shared/
COPY api/package*.json ./api/
RUN cd api && npm install --omit=dev
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/api/dist /app/api/dist
WORKDIR /app/api
EXPOSE 3000
CMD ["npm", "run", "start:prod"]