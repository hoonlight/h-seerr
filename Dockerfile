FROM node:18.18-alpine AS build_image

WORKDIR /app

ARG TARGETPLATFORM
ENV TARGETPLATFORM=${TARGETPLATFORM:-linux/amd64}

RUN \
  case "${TARGETPLATFORM}" in \
  'linux/arm64' | 'linux/arm/v7') \
  apk update && \
  apk add --no-cache python3 make g++ gcc libc6-compat bash && \
  yarn global add node-gyp \
  ;; \
  esac

COPY package.json yarn.lock ./
RUN CYPRESS_INSTALL_BINARY=0 yarn install --frozen-lockfile --network-timeout 1000000

COPY . ./

ARG COMMIT_TAG="local"
ENV COMMIT_TAG=${COMMIT_TAG}

RUN yarn build

# remove development dependencies
RUN yarn install --production --ignore-scripts --prefer-offline

RUN rm -rf src server .next/cache

RUN touch config/DOCKER

RUN echo "{\"commitTag\": \"${COMMIT_TAG}\"}" > committag.json


FROM node:18.18-alpine

# Metadata for Github Package Registry
LABEL org.opencontainers.image.source="https://github.com/Fallenbagel/jellyseerr"

WORKDIR /app

RUN apk add --no-cache tzdata tini && rm -rf /tmp/*

# copy from build image
COPY --from=build_image /app ./

ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "yarn", "start" ]

EXPOSE 5055
