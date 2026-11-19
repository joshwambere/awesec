import { DoctorOutcome, DoctorResult } from "@awesec/contracts";
import { describe, expect, it } from "vitest";
import { doctor, type RuntimeProbe } from "../src/index";

/** Fake adapter: proves core runs with injected I/O and no real host access. */
function fakeRuntime(nodeVersion: string): RuntimeProbe {
  return {
    nodeVersion: () => nodeVersion,
    platform: () => "testos",
    arch: () => "testarch",
  };
}

describe("core.doctor (called directly, fake adapter)", () => {
  it("is healthy on the minimum supported Node.js version", () => {
    const outcome = doctor({}, { runtime: fakeRuntime("v22.14.0") });

    expect(DoctorOutcome.safeParse(outcome).success).toBe(true);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(DoctorResult.parse(outcome.data)).toEqual(outcome.data);
    expect(outcome.data.healthy).toBe(true);
    expect(outcome.data.checks).toEqual([
      { id: "node", status: "pass", message: "Node.js 22.14.0" },
      { id: "platform", status: "pass", message: "testos-testarch" },
      expect.objectContaining({ id: "dependency-track", status: "skip" }),
    ]);
  });

  it("is unhealthy below the minimum Node.js version", () => {
    const outcome = doctor({}, { runtime: fakeRuntime("20.19.0") });

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.data.healthy).toBe(false);
    expect(outcome.data.checks[0]).toEqual({
      id: "node",
      status: "fail",
      message: "Node.js 20.19.0 is below the required 22.14.0",
    });
  });

  it("fails the node check on an unparseable version string", () => {
    const outcome = doctor({}, { runtime: fakeRuntime("banana") });

    expect(outcome.ok && outcome.data.checks[0]?.status).toBe("fail");
  });
});
