# Build the Angular portal
FROM node:18-alpine AS build
WORKDIR /app
COPY app/package*.json ./
RUN npm ci
COPY app ./
RUN npm run build -- --configuration=production

# Serve via Nginx
FROM nginx:1.25-alpine
COPY --from=build /app/dist/portal-app/browser /usr/share/nginx/html
