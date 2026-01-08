FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable \
  && apk add --no-cache curl \
  && pnpm install --prod
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]
