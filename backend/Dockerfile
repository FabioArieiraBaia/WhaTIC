# Stage 1: Build the application
FROM node:20 AS build

WORKDIR /usr/src/app
COPY . .

RUN npm ci && npm run generate:i18nkeys && npm run build

# Stage 2: Create the final image without source files
FROM node:20-slim

ARG TICKETZ_REGISTRY_URL

WORKDIR /usr/src/app

# Copy only the necessary build artifacts from the build stage
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/scripts ./scripts

ENV NODE_ENV=production
ENV TICKETZ_REGISTRY_URL=${TICKETZ_REGISTRY_URL}

EXPOSE 8080

CMD npx sequelize db:migrate --config dist/config/database.js --migrations-path dist/database/migrations \
  && node dist/server.js
