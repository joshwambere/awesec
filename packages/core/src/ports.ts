/**
 * Injected I/O interfaces. Core never touches the host directly; the CLI
 * (and later the portal) supplies real adapters, tests supply fakes.
 * M1 only needs a runtime probe. HTTP, filesystem and process-exec ports
 * are added with the features that need them.
 */
export interface RuntimeProbe {
  /** e.g. "22.14.0" or "v22.14.0" */
  nodeVersion(): string;
  /** e.g. "linux" */
  platform(): string;
  /** e.g. "x64" */
  arch(): string;
}

export interface DoctorPorts {
  runtime: RuntimeProbe;
}
