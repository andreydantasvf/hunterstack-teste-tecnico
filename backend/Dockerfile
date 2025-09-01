FROM node:22.18-alpine AS base
WORKDIR /app

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm install

FROM dependencies AS build
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS deploy
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
EXPOSE 3333
CMD ["npm", "run", "start"]

FROM dependencies AS dev
COPY . .
RUN npx prisma generate
EXPOSE 3333
EXPOSE 5555
CMD ["npm", "run", "dev"]
