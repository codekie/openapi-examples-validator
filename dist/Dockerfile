FROM node:18.16.0-alpine3.17

RUN npm install -g openapi-examples-validator@6.0.2

ENV NODE_OPTIONS="--unhandled-rejections=strict"
ENTRYPOINT ["openapi-examples-validator"]
CMD ["--help"]