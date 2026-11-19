import {
  type DoctorCheck,
  type DoctorInput,
  type DoctorResult,
  ok,
  type Result,
} from "@awesec/contracts";
import type { DoctorPorts } from "./ports";

export const MIN_NODE_VERSION = "22.14.0";

type Semver = readonly [number, number, number];

function parseSemver(raw: string): Semver | undefined {
  const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(raw.trim());
  if (!match) return undefined;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function compareSemver(a: Semver, b: Semver): number {
  for (let i = 0; i < 3; i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function checkNode(raw: string): DoctorCheck {
  const actual = parseSemver(raw);
  const min = parseSemver(MIN_NODE_VERSION) as Semver;
  if (!actual) {
    return { id: "node", status: "fail", message: `Unrecognised Node.js version "${raw}"` };
  }
  if (compareSemver(actual, min) < 0) {
    return {
      id: "node",
      status: "fail",
      message: `Node.js ${actual.join(".")} is below the required ${MIN_NODE_VERSION}`,
    };
  }
  return { id: "node", status: "pass", message: `Node.js ${actual.join(".")}` };
}

/**
 * Environment self-check. M1 stub: verifies the Node.js runtime and reports
 * integrations that are not implemented yet as "skip".
 */
export function doctor(_input: DoctorInput, ports: DoctorPorts): Result<DoctorResult> {
  const checks: DoctorCheck[] = [
    checkNode(ports.runtime.nodeVersion()),
    {
      id: "platform",
      status: "pass",
      message: `${ports.runtime.platform()}-${ports.runtime.arch()}`,
    },
    {
      id: "dependency-track",
      status: "skip",
      message: "Not configured (available in a later milestone)",
    },
  ];
  return ok({ healthy: checks.every((c) => c.status !== "fail"), checks });
}
