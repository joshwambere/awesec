import { awesecError, DoctorInput, type DoctorResult, errorCategory } from "@awesec/contracts";
import { type DoctorPorts, doctor } from "@awesec/core";
import { EXIT, type ExitCode, exitCodeFor } from "../exit-codes";
import type { Reporter } from "../reporters";

const ICON = { pass: "✓", warn: "!", fail: "✗", skip: "-" } as const;

function render(result: DoctorResult): string[] {
  const lines = result.checks.map((c) => `${ICON[c.status]} ${c.id.padEnd(18)} ${c.message}`);
  lines.push("", result.healthy ? "All checks passed." : "One or more checks failed.");
  return lines;
}

export function runDoctor(rawInput: unknown, ports: DoctorPorts, reporter: Reporter): ExitCode {
  const parsed = DoctorInput.safeParse(rawInput);
  if (!parsed.success) {
    const error = awesecError("ASEC-CFG-001", "Invalid input for doctor", parsed.error.issues);
    reporter.failure("doctor", error);
    return exitCodeFor(errorCategory(error.code));
  }

  const outcome = doctor(parsed.data, ports);
  if (!outcome.ok) {
    reporter.failure("doctor", outcome.error);
    return exitCodeFor(errorCategory(outcome.error.code));
  }

  reporter.success("doctor", outcome.data, render(outcome.data));
  return outcome.data.healthy ? EXIT.ok : exitCodeFor(errorCategory("ASEC-ENV-001"));
}
