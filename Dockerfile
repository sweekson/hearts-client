FROM node:8

ARG dest=/trend-hearts/

# Create app directory
RUN mkdir /log
RUN mkdir -p $dest
WORKDIR $dest

# Install app dependencies
COPY package*.json $dest
RUN npm install

# Copy source files
COPY . $dest

ENV NODE_ENV production

ENTRYPOINT ["npm", "start"]