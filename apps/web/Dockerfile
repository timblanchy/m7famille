ARG BASE_REGISTRY=docker.io
FROM ${BASE_REGISTRY}/node:24-alpine AS base

FROM base AS pruner

WORKDIR /app

RUN npm install --global turbo@2.7.6
COPY . .
RUN turbo prune @m7famille/web --docker

FROM base AS builder

WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN corepack enable && corepack prepare pnpm@10.28.2 --activate
COPY --from=pruner /app/out/json/ .

RUN pnpm config set inject-workspace-packages=true
RUN pnpm install --no-frozen-lockfile --ignore-scripts
COPY --from=pruner /app/out/full/ .

RUN pnpm --filter=@m7famille/web... build

FROM caddy:2-alpine AS production

COPY --from=builder /app/apps/web/dist /usr/share/caddy
COPY --from=builder /app/apps/web/Caddyfile /etc/caddy/Caddyfile

EXPOSE 3030

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
