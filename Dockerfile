FROM node:14.5.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

# Bundle app source
COPY . .

EXPOSE 5002

CMD [ "npm", "run" ,"server" ]
