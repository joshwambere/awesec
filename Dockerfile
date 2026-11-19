# syntax=docker/dockerfile:1

# Base image pinned by tag *and* digest. Bump both together.
# Runtime floor is Node 22.14 (package.json engines); the image tracks the latest 22.x patch.
# Alpine is enough: the runtime is one bundled .mjs plus cdxgen (pure JS) and syft (static binary).
# Revisit if a later milestone shells out to generators that need glibc, git, a JRE, etc.
ARG NODE_IMAGE=node:22.23.5-alpine3.24@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a
# Syft is a static binary copied from the official multi-arch image. Bump tag and digest together.
ARG SYFT_IMAGE=anchore/syft:v1.57.2@sha256:e97e20b6e6d1699c60296b66ab337941724f9bd06ac279d893eda89601fc4b2a

FROM ${SYFT_IMAGE} AS syft

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
# Declared after install so a new commit never invalidates the dependency layer.
ARG AWESEC_BUILD_SHA=dev
ARG AWESEC_CHANNEL=dev
ENV AWESEC_BUILD_SHA=$AWESEC_BUILD_SHA \
    AWESEC_CHANNEL=$AWESEC_CHANNEL
RUN pnpm --filter @awesec/cli build

# ---- runtime: Node, the bundle, cdxgen and syft, as a non-root user ----
FROM ${NODE_IMAGE} AS runtime
LABEL org.opencontainers.image.title="awesec" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.source="https://github.com/joshwambere/awesec"
ENV NODE_ENV=production

# Required, no default (pinned in docker/versions.env): the build fails without it.
ARG CDXGEN_VERSION
RUN test -n "$CDXGEN_VERSION" || { echo "CDXGEN_VERSION build arg is required" >&2; exit 1; } \
 && npm install --global --omit=dev --no-audit --no-fund "@cyclonedx/cdxgen@${CDXGEN_VERSION}" \
 && npm cache clean --force

COPY --from=syft /syft /usr/local/bin/syft

RUN addgroup -S -g 10001 awesec \
 && adduser -S -D -u 10001 -G awesec -h /home/awesec awesec

WORKDIR /app
COPY --from=build /src/packages/cli/dist/awesec.mjs /app/awesec.mjs
USER 10001:10001
ENTRYPOINT ["node", "/app/awesec.mjs"]
CMD ["--help"]
