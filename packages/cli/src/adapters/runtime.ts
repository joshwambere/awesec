import type { RuntimeProbe } from "@awesec/core";

export const nodeRuntime: RuntimeProbe = {
  nodeVersion: () => process.versions.node,
  platform: () => process.platform,
  arch: () => process.arch,
};
