FROM node:lts-bullseye AS development
WORKDIR /app

COPY package*.json ./
RUN npm ci --include=dev \
 && npm install -g @nestjs/cli \
 && npm cache clean --force

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

CMD ["npm", "run", "start:dev"]

FROM node:lts-bullseye AS build
WORKDIR /app
COPY . .
RUN npm ci --include=dev \
 && npm run build \
 && npx prisma generate \
 && npm prune --production

FROM node:lts-bullseye AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY --from=build /app/prisma /app/prisma

CMD npx prisma migrate deploy && node dist/main.js

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY --from=build /app/prisma /app/prisma
CMD ["node", "dist/main.js"]