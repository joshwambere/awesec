import type { Io } from "../io";
import type { Reporter } from "./types";

export function prettyReporter(io: Io): Reporter {
  return {
    success(_command, _data, human) {
      io.stdout(`${human.join("\n")}\n`);
    },
    failure(_command, error) {
      io.stderr(`error ${error.code}: ${error.message}\n`);
    },
  };
}
