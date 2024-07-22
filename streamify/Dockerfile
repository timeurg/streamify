# syntax=docker/dockerfile:1

FROM node:lts-alpine AS development
WORKDIR /home/node/app
COPY --chown=node:node package*.json ./
RUN npm ci
COPY --chown=node:node . .
USER node
ENTRYPOINT ["npm"]

FROM node:lts-alpine AS build
WORKDIR /home/node/app
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=development /home/node/app/node_modules ./node_modules
COPY --chown=node:node . .
ENV NODE_ENV=production
RUN npm run build
USER node

FROM node:lts-alpine AS deps
WORKDIR /home/node/app
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=development /home/node/app/node_modules ./node_modules
COPY --chown=node:node . .
ENV NODE_ENV=production
RUN npm ci --only=production && npm cache clean --force
USER node

FROM node:lts-alpine AS production
WORKDIR /home/node/app
ENV NODE_ENV=production
COPY --chown=node:node --from=deps /home/node/app/node_modules ./node_modules
COPY --chown=node:node --from=build /home/node/app/dist ./dist
ENTRYPOINT ["node", "dist/main.js"]
USER node