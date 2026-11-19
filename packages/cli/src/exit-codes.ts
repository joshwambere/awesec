import type { ErrorCategory } from "@awesec/contracts";

export const EXIT = {
  ok: 0,
  gate: 1,
  config: 2,
  generator: 3,
  dt: 4,
  /** EX_SOFTWARE from sysexits.h: a bug in awesec, not in the user's input. */
  internal: 70,
} as const satisfies Record<"ok" | ErrorCategory, number>;

export type ExitCode = (typeof EXIT)[keyof typeof EXIT];

export function exitCodeFor(category: ErrorCategory): ExitCode {
  return EXIT[category];
}
