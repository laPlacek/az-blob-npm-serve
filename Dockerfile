FROM node:18-alpine
WORKDIR /app
COPY ./src ./src
COPY ./package.json .
COPY ./package-lock.json .
COPY ./tsconfig.json .
RUN npm ci
RUN npm run build
ENTRYPOINT ["npm", "run", "start"]
EXPOSE 3000