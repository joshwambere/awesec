import pkg from "../package.json" with { type: "json" };

export interface BuildInfo {
  version: string;
  channel: string;
  sha: string;
}

/**
 * `dev` sha → `<version> (dev)`; otherwise `<version> (<channel>, <sha7>)`.
 * Pure: the build values are passed in, so this is unit-testable without a bundle.
 */
export function formatVersion({ version, channel, sha }: BuildInfo): string {
  if (sha === "dev") return `${version} (dev)`;
  return `${version} (${channel}, ${sha.slice(0, 7)})`;
}

export const buildInfo: BuildInfo = {
  version: pkg.version,
  channel: __AWESEC_CHANNEL__,
  sha: __AWESEC_BUILD_SHA__,
};

export const VERSION_STRING = formatVersion(buildInfo);
