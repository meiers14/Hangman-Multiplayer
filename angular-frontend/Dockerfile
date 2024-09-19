# Stage 1: Build Stage
FROM node:alpine AS frontend-build
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm run build --prod

# Stage 2: Final Stage 
FROM nginx:alpine
COPY --from=frontend-build /usr/src/app/dist/angular-frontend/browser /usr/share/nginx/html
EXPOSE 80