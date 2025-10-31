# ---------- Build Stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Copy only dependency files first for caching
COPY package*.json ./

# Install ALL dependencies (including dev for vite)
RUN npm install

# Copy project files
COPY . .

# Build the production bundle (Vite)
RUN npm run build

# ---------- Serve Stage ----------
FROM nginx:alpine

# Set working directory for Nginx
WORKDIR /usr/share/nginx/html

# Copy built files from build stage
COPY --from=build /app/dist .

# Expose default Nginx port
EXPOSE 80

# Healthcheck to ensure Nginx is serving correctly
HEALTHCHECK CMD wget -qO- http://localhost/ || exit 1

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
