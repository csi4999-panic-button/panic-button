# Use Node v8.x
FROM node:8.4-alpine AS clientbuild

# set up working directory
WORKDIR /opt/panic-button

# build the client
COPY src/client .
RUN npm install
RUN npm run build

# create a new image
FROM node:8.4-alpine

# install curl for healthcheck
RUN apk update && apk add curl

# set up working directory
WORKDIR /opt/panic-button

# install dependencies for npm and build deps for bcrypt
COPY package.json package-lock.json ./
RUN apk add --no-cache make gcc g++ python git && \
    npm install --build-from-source=bcrypt && \
    apk del make gcc g++ python git

# copy required files
COPY src/server src/server
COPY --from=clientbuild /opt/panic-button/dist src/client/dist
COPY seed.js .
COPY test/ test/

# runs on port 3000
EXPOSE 3000

# healthcheck for automatic restart
HEALTHCHECK --interval=5s --timeout=3s CMD curl --fail http://localhost:3000/api/v1 || exit 1

CMD ["node", "src/server/app.js"]
