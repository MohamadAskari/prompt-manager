FROM node:18-alpine
WORKDIR /prompt-manager-ui

COPY . .
COPY package*.json ./

RUN npm install
EXPOSE 3000

CMD ["npm", "start"]