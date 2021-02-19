FROM node:15.8.0-alpine as build-stage
WORKDIR /stage
COPY ./package*.json ./
COPY ./webpack.mix.js .
COPY ./src/assets ./src/assets
RUN npm install
RUN npx mix --production

FROM nginx:1.19.6-alpine as production-stage
WORKDIR /usr/share/nginx/html
COPY ./src/*.html ./
COPY --from=build-stage /stage/src/assets/public ./assets/public
EXPOSE 80
