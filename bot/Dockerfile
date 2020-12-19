FROM node:14.15.1-alpine

WORKDIR /home/node/shinsengumi

COPY . .

RUN chown -R node:node .

USER node

RUN npm install

CMD npm start