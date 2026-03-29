ARG BASE_REGISTRY=docker.io
FROM ${BASE_REGISTRY}/node:24-alpine AS base

FROM base AS pruner

WORKDIR /app

RUN npm install --global turbo@2.7.6
COPY . .
RUN turbo prune @m7famille/backend --docker

FROM base AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

RUN corepack enable && corepack prepare pnpm@10.28.2 --activate
COPY --from=pruner /app/out/json/ .

RUN pnpm config set inject-workspace-packages=true
RUN pnpm install --no-frozen-lockfile --ignore-scripts
COPY --from=pruner /app/out/full/ .

RUN pnpm --filter=@m7famille/backend... build
RUN pnpm deploy --prod --filter=@m7famille/backend /prod

FROM base AS runner

RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /prod/node_modules ./node_modules
COPY --from=builder /prod/dist/ ./

USER node

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["node", "Api.js"]
