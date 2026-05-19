FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

FROM nginx:alpine
COPY --from=build /app/dist/voicetask-web/browser /usr/share/nginx/html
COPY nginx-angular.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
