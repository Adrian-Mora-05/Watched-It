FROM node:20-alpine
WORKDIR /app

COPY shared/ ./shared/

COPY api/package*.json ./api/
RUN cd api && npm install

# Copy api source
COPY api/ ./api/

WORKDIR /app/api
CMD ["npm", "run", "start:dev"]