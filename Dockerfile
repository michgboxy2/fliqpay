FROM node:alpine

WORKDIR /usr/src/fliqpay
COPY package.json .
RUN npm install --only=prod
COPY . .

# CMD ["npm", "start"]
CMD ["/bin/bash"]