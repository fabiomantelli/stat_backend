FROM node:14.5.0-alpine

ENV HOME=/home/medfasee

RUN mkdir -p $HOME/backend

WORKDIR $HOME/backend

COPY package.json yarn.lock ./

COPY . $HOME/backend

RUN yarn

EXPOSE 3003

CMD ["yarn", "start"]