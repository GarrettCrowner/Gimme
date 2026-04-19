# server/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer cache)
COPY package.json ./
RUN npm install --omit=dev

# Copy source
COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
