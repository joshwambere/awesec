import type { AwesecError } from "@awesec/contracts";
import { z } from "zod";

export const ReporterName = z.enum(["pretty", "json"]);
export type ReporterName = z.infer<typeof ReporterName>;

export interface Reporter {
  /** `human` is the pretty rendering; the json reporter ignores it and emits `data`. */
  success(command: string, data: unknown, human: readonly string[]): void;
  failure(command: string, error: AwesecError): void;
}
