FROM node:14.11.0-alpine3.12

RUN npm install -g openapi-examples-validator@4.2.2

ENV NODE_OPTIONS="--unhandled-rejections=strict"
ENTRYPOINT ["openapi-examples-validator"]
CMD ["--help"]