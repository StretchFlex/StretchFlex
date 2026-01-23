FROM node:24-alpine
WORKDIR /frontend
COPY package*.json ./
# RUN npm install
RUN npm install -g http-server
COPY src/ ./
EXPOSE 3000
CMD ["http-server", ".", "-p", "3000", "-c-1"]