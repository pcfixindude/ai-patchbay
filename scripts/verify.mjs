import { spawn } from "node:child_process";

const stages = ["db:reset", "db:test", "db:types:check", "lint", "typecheck", "test", "test:e2e", "test:edge", "build"];
const onlyIndex = process.argv.indexOf("--only");
const requestedStage = onlyIndex === -1 ? undefined : process.argv[onlyIndex + 1];
const selectedStages = requestedStage ? stages.filter((stage) => stage === requestedStage) : stages;

if (requestedStage && selectedStages.length === 0) {
  console.error(`Unknown verification stage: ${requestedStage}`);
  process.exit(2);
}

let activeStage = "";
let activeChild;
let receivedSignal = false;
for (const signal of ["SIGTERM", "SIGINT", "SIGHUP"]) {
  process.on(signal, () => {
    receivedSignal = true;
    console.error(`[verify] received ${signal} during ${activeStage || "startup"}`);
    activeChild?.kill(signal);
  });
}
process.on("uncaughtException", (error) => console.error("[verify] uncaught exception", error));
process.on("unhandledRejection", (error) => console.error("[verify] unhandled rejection", error));
process.on("exit", (code) => console.log(`[verify] parent exited ${code}${receivedSignal ? " after signal" : ""}`));

function run(stage, index) {
  activeStage = stage;
  console.log(`\n[verify] ${index + 1}/${selectedStages.length} ${stage}`);
  return new Promise((resolve, reject) => {
    const child = spawn("pnpm", [stage], { stdio: "inherit" });
    activeChild = child;
    const heartbeat = setInterval(() => console.log(`[verify] ${stage} still running...`), 15_000);
    child.once("error", (error) => { clearInterval(heartbeat); reject(error); });
    child.once("exit", (code, signal) => {
      clearInterval(heartbeat);
      activeChild = undefined;
      if (code === 0) { console.log(`[verify] ✓ ${stage}`); resolve(); }
      else reject(new Error(`${stage} ${signal ? `received ${signal}` : `exited ${code}`}`));
    });
  });
}

try {
  for (const [index, stage] of selectedStages.entries()) await run(stage, index);
} catch (error) {
  console.error(`[verify] ✗ ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
}
