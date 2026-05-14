# Use a Node.js image
FROM node:18-slim

WORKDIR /app

# Copy the package files first to speed up builds
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Start the React development server
CMD ["npm", "start"]