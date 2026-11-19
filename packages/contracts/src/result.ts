import { z } from "zod";
import { AwesecError } from "./errors";

/** Every core command returns a Result: typed data or a typed error, never a throw. */
export type Result<T> = { ok: true; data: T } | { ok: false; error: AwesecError };

export function resultSchema<T extends z.ZodType>(data: T) {
  return z.discriminatedUnion("ok", [
    z.object({ ok: z.literal(true), data }),
    z.object({ ok: z.literal(false), error: AwesecError }),
  ]);
}

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function err<T = never>(error: AwesecError): Result<T> {
  return { ok: false, error };
}
