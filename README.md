# awesec

A CLI that generates CycloneDX SBOMs, uploads them to OWASP Dependency-Track, and builds security reports.

> Early days: only `awesec --version` and `awesec doctor` exist so far.

## Using the edge image

Every merge to `main` publishes a multi-arch (`linux/amd64`, `linux/arm64`) image after it passes a smoke test on both architectures:

```sh
docker pull ghcr.io/joshwambere/awesec:edge
docker run --rm ghcr.io/joshwambere/awesec:edge --version
# 0.1.0 (edge, a1b2c3d)   <- version, channel, commit
```

> [!WARNING]
> `:edge` moves on every merge to `main`. Never use it in client pipelines: what you get tomorrow is not what you tested today.

Pin instead, either to the immutable per-commit tag or to a digest:

```sh
docker pull ghcr.io/joshwambere/awesec:sha-a1b2c3d        # tag per commit on main
docker pull ghcr.io/joshwambere/awesec@sha256:<digest>    # strongest pin
```

Find the digest for a tag with `docker buildx imagetools inspect ghcr.io/joshwambere/awesec:sha-a1b2c3d`.

## Development

Requires Node.js ≥ 22.14 and pnpm 10.

```sh
pnpm install
pnpm lint && pnpm typecheck && pnpm test && pnpm build
node packages/cli/dist/awesec.mjs --version
```

Run `pnpm changeset` to record a user-facing change.
