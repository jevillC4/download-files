FROM node:12
WORKDIR /app
COPY src ./src
COPY config ./config
COPY helpers.js ./
COPY index.js ./
COPY .env ./
COPY package*.json ./
RUN npm install
CMD [ "node", "index.js" ]