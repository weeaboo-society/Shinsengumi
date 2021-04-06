FROM node:14.15.1-alpine

WORKDIR /home/node/shinsengumi

COPY package*.json ./

RUN npm install

COPY . .

RUN chown -R node:node .

USER node

CMD ["npm", "start"]