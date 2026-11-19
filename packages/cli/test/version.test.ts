import { describe, expect, it } from "vitest";
import { formatVersion } from "../src/version";

const SHA = "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678";

describe("formatVersion", () => {
  it("prints only the version for dev builds", () => {
    expect(formatVersion({ version: "0.1.0", channel: "dev", sha: "dev" })).toBe("0.1.0 (dev)");
  });

  it("prints channel and short sha for edge builds", () => {
    expect(formatVersion({ version: "0.1.0", channel: "edge", sha: SHA })).toBe(
      "0.1.0 (edge, a1b2c3d)",
    );
  });

  it("truncates the sha to exactly 7 characters", () => {
    const out = formatVersion({ version: "0.1.0", channel: "pr", sha: SHA });
    const short = /\(pr, ([0-9a-f]+)\)$/.exec(out)?.[1];
    expect(short).toBe(SHA.slice(0, 7));
    expect(short).toHaveLength(7);
  });
});
