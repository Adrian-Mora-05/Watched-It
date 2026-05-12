FROM node:20-alpine AS builder
WORKDIR /app
COPY shared/ ./shared/
COPY api/package*.json ./api/
COPY api/tsconfig*.json ./api/
RUN cd api && npm install
COPY api/ ./api/
WORKDIR /app/api
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY shared/ ./shared/
COPY api/package*.json ./api/
RUN cd api && npm install --omit=dev
COPY --from=builder /app/api/dist /app/api/dist
RUN ln -s /app/api/node_modules /app/node_modules
WORKDIR /app/api
EXPOSE 3000
ENV NODE_PATH=/app/api/node_modules
CMD ["npm", "run", "start:prod"]