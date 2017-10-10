# Use Node v8.x 
FROM node:8

WORKDIR /usr/src/app

# npm@v5+ should include the lock file as well
COPY package.json ./package.json
COPY src/client/package.json  ./src/client/package.json

# install packages and copy source 
RUN npm install --prefix ./src/client 
COPY ./src/client ./src/client
RUN npm run build --prefix ./src/client
RUN npm install

COPY . .

# pass port to interface and start server
EXPOSE 3000
CMD ["node", "src/server/app.js"]
