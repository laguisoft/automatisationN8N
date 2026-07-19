FROM node:20-alpine AS base
WORKDIR /usr/src/app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS build
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/config ./config
COPY --from=build /usr/src/app/prompts ./prompts
COPY package.json ./

EXPOSE 3000
CMD ["node", "dist/index.js"]
