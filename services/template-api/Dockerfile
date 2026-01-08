FROM node:20-alpine
WORKDIR /app
COPY ../../package.json ../../tsconfig.base.json ./
COPY package.json tsconfig.json ./
COPY src ./src
RUN npm install --silent
RUN npm run build
EXPOSE 3001
CMD ["node", "dist/main.js"]
