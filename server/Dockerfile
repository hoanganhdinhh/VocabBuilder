FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies first to leverage layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Bundle app source
COPY . .

# Expose the port used by the API server
EXPOSE 3000
ENV NODE_ENV=production

# Start the application
CMD ["node", "server.js"]