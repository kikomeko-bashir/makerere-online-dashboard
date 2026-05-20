# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config for SPA routing on port 3535
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3535

CMD ["nginx", "-g", "daemon off;"]
