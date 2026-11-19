import { awesecError } from "@awesec/contracts";
import type { DoctorPorts } from "@awesec/core";
import { Command, CommanderError, Option } from "commander";
import pkg from "../package.json" with { type: "json" };
import { nodeRuntime } from "./adapters/runtime";
import { runDoctor } from "./commands/doctor";
import { EXIT, type ExitCode } from "./exit-codes";
import type { Io } from "./io";
import { createReporter, type Reporter, ReporterNameSchema } from "./reporters";

export const VERSION: string = pkg.version;

export interface Deps {
  io: Io;
  ports: DoctorPorts;
}

export const defaultPorts: DoctorPorts = { runtime: nodeRuntime };

function reporterFor(cmd: Command, io: Io): Reporter {
  const opts = cmd.optsWithGlobals<{ reporter: string; json?: boolean }>();
  const name = opts.json ? "json" : ReporterNameSchema.parse(opts.reporter);
  return createReporter(name, io);
}

function internalError(reporter: Reporter, command: string, cause: unknown): ExitCode {
  const message = cause instanceof Error ? cause.message : String(cause);
  reporter.failure(command, awesecError("ASEC-INT-001", message));
  return EXIT.internal;
}

/** Parses argv, runs one command, and returns the process exit code. Never calls process.exit. */
export async function run(argv: readonly string[], deps: Deps): Promise<ExitCode> {
  const { io, ports } = deps;
  let exitCode: ExitCode = EXIT.ok;

  const program = new Command()
    .name("awesec")
    .description(pkg.description)
    .version(VERSION, "-V, --version", "print the awesec version")
    .addOption(
      new Option("--reporter <name>", "output format")
        .choices(ReporterNameSchema.options)
        .default("pretty"),
    )
    .option("--json", "shorthand for --reporter json")
    .showHelpAfterError()
    .exitOverride()
    .configureOutput({ writeOut: io.stdout, writeErr: io.stderr });

  program
    .command("doctor")
    .description("check that the environment can run awesec")
    .action((_opts: unknown, cmd: Command) => {
      const reporter = reporterFor(cmd, io);
      try {
        exitCode = runDoctor({}, ports, reporter);
      } catch (cause) {
        exitCode = internalError(reporter, "doctor", cause);
      }
    });

  try {
    await program.parseAsync(argv, { from: "node" });
  } catch (cause) {
    if (cause instanceof CommanderError) {
      // --help / --version exit 0; any usage error is a config error.
      return cause.exitCode === 0 ? EXIT.ok : EXIT.config;
    }
    return internalError(createReporter("pretty", io), "awesec", cause);
  }
  return exitCode;
}
