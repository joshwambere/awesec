import type { Io } from "../io";
import { jsonReporter } from "./json";
import { prettyReporter } from "./pretty";
import type { Reporter, ReporterName } from "./types";

export type { Reporter, ReporterName } from "./types";
export { ReporterName as ReporterNameSchema } from "./types";

export function createReporter(name: ReporterName, io: Io): Reporter {
  return name === "json" ? jsonReporter(io) : prettyReporter(io);
}
