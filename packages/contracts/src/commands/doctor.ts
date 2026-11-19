import { z } from "zod";
import { resultSchema } from "../result";

/** `doctor` takes no options in M1; strict() rejects unknown keys. */
export const DoctorInput = z.object({}).strict();
export type DoctorInput = z.infer<typeof DoctorInput>;

export const CheckStatus = z.enum(["pass", "warn", "fail", "skip"]);
export type CheckStatus = z.infer<typeof CheckStatus>;

export const DoctorCheck = z.object({
  id: z.string().min(1),
  status: CheckStatus,
  message: z.string(),
});
export type DoctorCheck = z.infer<typeof DoctorCheck>;

export const DoctorResult = z.object({
  /** false when any check has status "fail". */
  healthy: z.boolean(),
  checks: z.array(DoctorCheck),
});
export type DoctorResult = z.infer<typeof DoctorResult>;

export const DoctorOutcome = resultSchema(DoctorResult);
