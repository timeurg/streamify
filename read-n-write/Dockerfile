# syntax=docker/dockerfile:1

FROM node:lts-alpine As development
WORKDIR /home/node/app
COPY --chown=node:node package*.json ./
RUN npm ci
COPY --chown=node:node . .
RUN chown -R node:node .
# RUN npm i -g @nestjs/cli
USER node
CMD ["npm"]

FROM node:lts-alpine As build
WORKDIR /home/node/app
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=development /home/node/app/node_modules ./node_modules
COPY --chown=node:node . .
ENV NODE_ENV production
RUN npm run build
RUN npm ci --only=production && npm cache clean --force
USER node

FROM node:lts-alpine As production
WORKDIR /home/node/app
ENV NODE_ENV production
COPY --chown=node:node --from=build /home/node/app/node_modules ./node_modules
COPY --chown=node:node --from=build /home/node/app/dist ./dist
USER node