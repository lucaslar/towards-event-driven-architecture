FROM node:16-alpine AS appbuild
WORKDIR /usr/src/app
COPY . .
RUN npm i -g rimraf
RUN npm i -g typescript
RUN npm ci
RUN npm run build

FROM node:16-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=appbuild /usr/src/app/build ./build
CMD [ "npm", "start" ]
