FROM node:14.15.1-alpine

WORKDIR /home/node/shinsengumi

RUN npm install -g yarn

RUN yarn set version berry

COPY package*.json ./

RUN yarn install

COPY . .

RUN chown -R node:node .

USER node

CMD ["npm", "start"]