# Use Node v8.x 
FROM node:8

WORKDIR /usr/src/app

# npm@v5+ should include the lock file as well
COPY package.json package-lock.json ./

# install packages and copy source 
RUN npm install

RUN cd src/client && npm install && cd ../..

COPY . .
# pass port to interface and start server
EXPOSE 3000
CMD ["npm", "start"]
