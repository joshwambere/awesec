import type { Io } from "../io";
import type { Reporter } from "./types";

/** Emits exactly one JSON envelope on stdout: { ok, command, data | error }. */
export function jsonReporter(io: Io): Reporter {
  const emit = (envelope: object) => io.stdout(`${JSON.stringify(envelope)}\n`);
  return {
    success(command, data) {
      emit({ ok: true, command, data });
    },
    failure(command, error) {
      emit({ ok: false, command, error });
    },
  };
}
