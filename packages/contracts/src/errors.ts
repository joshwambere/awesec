import { z } from "zod";

/**
 * Error categories. The CLI maps each category to a process exit code;
 * the portal can map them to HTTP statuses. Core only ever picks a code.
 */
export const ErrorCategory = z.enum(["gate", "config", "generator", "dt", "internal"]);
export type ErrorCategory = z.infer<typeof ErrorCategory>;

type CatalogueCode = `ASEC-${Uppercase<string>}-${number}`;

/**
 * Error-code catalogue. Format: `ASEC-<AREA>-<NNN>`.
 * Areas: CFG (input/config), ENV (runtime environment), GEN (SBOM generator),
 * DT (Dependency-Track / network), GATE (policy gate), INT (internal bug).
 * Codes are append-only: never renumber or reuse one.
 */
export const ERROR_CATALOGUE = {
  "ASEC-CFG-001": { category: "config", title: "Invalid command input" },
  "ASEC-ENV-001": { category: "config", title: "Runtime environment check failed" },
  "ASEC-INT-001": { category: "internal", title: "Unexpected internal error" },
} as const satisfies Record<CatalogueCode, { category: ErrorCategory; title: string }>;

export const ERROR_CODE_PATTERN = /^ASEC-[A-Z]{2,5}-\d{3}$/;

type ErrorCodeKey = keyof typeof ERROR_CATALOGUE;
export const ErrorCode = z.enum(Object.keys(ERROR_CATALOGUE) as [ErrorCodeKey, ...ErrorCodeKey[]]);
export type ErrorCode = z.infer<typeof ErrorCode>;

export const AwesecError = z.object({
  code: ErrorCode,
  message: z.string().min(1),
  details: z.unknown().optional(),
});
export type AwesecError = z.infer<typeof AwesecError>;

export function errorCategory(code: ErrorCode): ErrorCategory {
  return ERROR_CATALOGUE[code].category;
}

export function awesecError(code: ErrorCode, message: string, details?: unknown): AwesecError {
  return details === undefined ? { code, message } : { code, message, details };
}
