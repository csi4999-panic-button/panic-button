# Use Node v8.x 
FROM node:8

ENV APP_PATH /panicd
ENV PATH $APP_PATH/src/client/node_modules/@angular/cli/bin/:$PATH

WORKDIR $APP_PATH

# npm@v5+ should include the lock file as well
COPY package.json ./package.json
COPY src/client src/client

# install packages and copy source 
RUN mkdir src/client/node_modules && cd src/client && npm install && ng build && rm -rf ./node_modules && cd ../..
COPY ./src/client ./src/client

RUN npm install
COPY . .

# pass port to interface and start server
EXPOSE 3000
CMD ["node", "src/server/app.js"]
