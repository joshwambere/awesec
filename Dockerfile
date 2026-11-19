# syntax=docker/dockerfile:1

# Base image pinned by tag *and* digest. Bump both together.
# Runtime floor is Node 22.14 (package.json engines); the image tracks the latest 22.x patch.
# Alpine is enough: the runtime is one bundled .mjs with no native modules or OS tooling.
# Revisit if a later milestone shells out to generators that need glibc, git, a JRE, etc.
ARG NODE_IMAGE=node:22.23.5-alpine3.24@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a

# ---- build: install with the lockfile, bundle to a single file ----
FROM ${NODE_IMAGE} AS build
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
WORKDIR /src
RUN corepack enable

# Manifests first so the dependency layer is cached across source changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/contracts/package.json packages/contracts/
COPY packages/core/package.json packages/core/
COPY packages/cli/package.json packages/cli/
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter @awesec/cli build

# ---- runtime: just Node and the bundle, as a non-root user ----
FROM ${NODE_IMAGE} AS runtime
LABEL org.opencontainers.image.title="awesec" \
      org.opencontainers.image.licenses="MIT"
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /src/packages/cli/dist/awesec.mjs /app/awesec.mjs
# `node` (uid 1000) ships with the official image.
USER node
ENTRYPOINT ["node", "/app/awesec.mjs"]
CMD ["--help"]
