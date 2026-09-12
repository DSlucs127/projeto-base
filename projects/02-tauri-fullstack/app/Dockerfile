FROM node:22-alpine AS build

WORKDIR /workspace
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY app/package.json app/
COPY design-system/package.json design-system/
RUN pnpm install --frozen-lockfile --filter @template/app...
COPY . .
RUN pnpm --filter @template/app build

FROM nginx:1.27-alpine

COPY --from=build /workspace/app/dist /usr/share/nginx/html
COPY app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
