FROM node:22.18-alpine AS base
WORKDIR /app

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm install
COPY . .

FROM dependencies AS build
RUN npm run build

FROM build AS production
RUN npm prune --production
COPY --from=build /app/package.json ./
COPY --from=build /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/next.config.ts ./
COPY --from=build /app/public ./public
RUN npm install --only=production
EXPOSE 3000
CMD ["npm", "start"]

FROM dependencies AS dev
COPY --from=dependencies /app ./
EXPOSE 3000
CMD ["npm", "run", "dev"]
