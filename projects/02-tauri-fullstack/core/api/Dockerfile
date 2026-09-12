FROM node:22-alpine AS build

WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY core/api/package.json core/api/
COPY app/package.json app/
COPY design-system/package.json design-system/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @template/api prisma:generate
RUN pnpm --filter @template/api build

FROM node:22-alpine AS runtime

WORKDIR /workspace
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /workspace/package.json /workspace/pnpm-workspace.yaml /workspace/pnpm-lock.yaml ./
COPY --from=build /workspace/core/api/package.json ./core/api/package.json
COPY --from=build /workspace/app/package.json ./app/package.json
COPY --from=build /workspace/design-system/package.json ./design-system/package.json
# Instalacao completa (sem --prod): o CLI do Prisma (devDependency) e necessario
# para `prisma migrate deploy` no boot do container.
RUN pnpm install --frozen-lockfile --filter @template/api...
COPY --from=build /workspace/core/api/dist ./core/api/dist
COPY --from=build /workspace/core/api/prisma ./core/api/prisma
COPY --from=build /workspace/core/i18n/locales ./core/i18n/locales
COPY --from=build /workspace/plugins ./plugins

WORKDIR /workspace/core/api
EXPOSE 3000
CMD ["sh", "-c", "pnpm prisma:deploy && node dist/main.js"]
