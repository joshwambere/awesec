import { processIo } from "./io";
import { defaultPorts, run } from "./program";

process.exitCode = await run(process.argv, { io: processIo, ports: defaultPorts });
