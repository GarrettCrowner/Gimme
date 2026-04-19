# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Cache bust: 2
COPY package.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
