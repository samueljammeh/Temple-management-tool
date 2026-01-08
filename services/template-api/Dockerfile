FROM node:18-alpine

WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && pnpm install

COPY src ./src
COPY tsconfig.json ./

EXPOSE 3001
CMD ["pnpm", "dev"]
