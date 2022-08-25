FROM node:latest
WORKDIR /Server
COPY package.json ./
RUN npm install
COPY . ./

CMD npm run start