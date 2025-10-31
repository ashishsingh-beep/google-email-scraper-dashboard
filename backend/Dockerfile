# Use Playwright base image with browsers preinstalled matching our Playwright version
FROM mcr.microsoft.com/playwright:v1.56.1-jammy

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies (only prod)
RUN npm ci --omit=dev

# Copy the rest of the backend source
COPY . .

# Expose API port
EXPOSE 5000

# Set environment defaults
ENV NODE_ENV=production \
    PORT=5000 \
    HEADLESS=true

# Safety: Ensure browsers are available (base image already has them)
RUN npx playwright install --with-deps || true

# Run the backend
CMD ["node", "index.js"]
