FROM node:20-alpine AS builder
WORKDIR /app
COPY shared/ ./shared/
COPY api/package*.json ./api/
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
COPY --from=builder /app/api/node_modules /app/api/node_modules
RUN ln -s /app/api/node_modules /app/node_modules 
WORKDIR /app/api
EXPOSE 3000
CMD ["npm", "run", "start:prod"]