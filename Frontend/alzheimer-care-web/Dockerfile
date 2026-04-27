# Stage 1: Build
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Run
FROM node:20-slim
WORKDIR /app
COPY --from=build /app/dist/alzheimer-care-web ./dist/alzheimer-care-web
EXPOSE 4000
CMD ["node", "dist/alzheimer-care-web/server/server.mjs"]
