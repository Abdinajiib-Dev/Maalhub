FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

# Install all dependencies using the root lockfile
RUN npm ci

# Copy the rest of the application
COPY . .

# The backend runs on port 5000 by default in the app
EXPOSE 5000

# Start the server
WORKDIR /app/server
CMD ["npm", "start"]
