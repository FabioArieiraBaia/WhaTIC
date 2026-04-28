FROM node:20-alpine
RUN apk add --no-cache redis
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run generate:i18nkeys
RUN npm run build
EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production
ENV DB_HOST=34.61.204.112
ENV DB_NAME=whatic
ENV DB_USER=postgres
ENV DB_PASS=Whatic_password_123@
ENV DB_DIALECT=postgres
ENV JWT_SECRET=ticketz_pro_secret
ENV JWT_REFRESH_SECRET=ticketz_pro_refresh_secret
ENV BACKEND_URL=https://whatic-api-315750790111.us-central1.run.app
ENV FRONTEND_URL=https://whatic-frontend-315750790111.us-central1.run.app
ENV STORAGE_TYPE=gcs
ENV GCS_BUCKET=whatic-media-315750790111
ENV REDIS_URI=redis://127.0.0.1:6379
ENV REDIS_OPT_PORT=6379

# Inicia o Redis sem disco e depois a aplicação
CMD redis-server --protected-mode no --save "" --appendonly no & sleep 4 && npx -y sequelize-cli db:migrate && node dist/server.js
