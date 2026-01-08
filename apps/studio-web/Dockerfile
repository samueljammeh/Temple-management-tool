FROM node:20-alpine
WORKDIR /app
COPY ../../package.json ../../tsconfig.base.json ./
COPY package.json tsconfig.json next.config.js ./
COPY next-env.d.ts ./
COPY pages ./pages
COPY components ./components
COPY src ./src
RUN npm install --silent
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
