# Repository guidance

## Current state and scope
- This repository is a TypeScript scaffold for a planned LAN-accessible LM Studio chat SPA.
- `src/index.ts` currently contains only a console message. No backend, frontend framework, streaming implementation, or test suite exists yet.
- Read `agents/documentation/plan.md` and `agents/documentation/roadmap.md` before architecture work. They describe intended behavior and recommendations, not completed features.
- The plans recommend a Node.js proxy backend, preferably Fastify, and a lightweight frontend, preferably Svelte. No framework is installed; keep implementation choices explicit and update the plans when decisions change.

## Repository map
- `src/`: TypeScript source included by the compiler.
- `package.json`: package metadata, dependencies, and the build script.
- `tsconfig.json`: strict TypeScript configuration; ES2016 target, CommonJS modules, output in `dist/`.
- `bun.lock`: dependency lockfile. Use Bun for dependency management and keep this file synchronized with package changes.
- `agents/documentation/`: project architecture and implementation plans.
- `.idea/`: IDE metadata; avoid unrelated changes here.

## Development commands
Run commands from the repository root:
- `bun install`: install dependencies.
- `bun run build`: compile TypeScript with the configured `tsc` script.
- `bun run build --noEmit`: check types without generating output.

There are currently no start, dev-server, lint, or test scripts. Do not report those checks as passing or assume the application can already be served. When adding tooling, add the corresponding scripts and document their usage.

## Implementation conventions
- Keep application code in TypeScript with strict checking enabled. Follow nearby code style and avoid unrelated formatting changes.
- Keep changes focused on the requested task and preserve existing staged, unstaged, and untracked user work.
- Add dependencies only when needed for the implementation; update `package.json` and `bun.lock` together.
- Do not hand-edit generated compiler output or commit `node_modules/` or `dist/`. The current ignore file does not exclude `dist/`, so check the working tree after builds.
- Keep architecture documentation aligned with implemented behavior. Clearly distinguish future work from available functionality.

## Planned application boundaries
Apply these guidelines when implementing the planned application:
- Route browser chat requests through the backend proxy; keep LM Studio credentials on the server.
- Configure the upstream URL and credentials through environment variables. The plans use `LM_STUDIO_URL` and `LM_STUDIO_API_KEY` (one diagram abbreviates the key as `API_KEY`); keep naming consistent in implementation and examples.
- Never commit real credentials or expose API keys in browser bundles, responses, or logs. Use placeholders in configuration examples.
- Forward model output incrementally rather than buffering the entire response. Keep HTTP transport chunks distinct from application-level stream events when parsing.
- Handle upstream failures, malformed stream data, and client cancellation; release upstream resources when the client disconnects.
- Make LAN binding and allowed browser origins deliberate configuration choices.

## Validation
- For TypeScript changes, run the type check or build and report any failures accurately.
- Add focused tests alongside meaningful behavior as test infrastructure is introduced.
- For streaming work, cover split events across transport chunks, upstream errors, completion, and cancellation.
- For UI integration, verify message submission, incremental rendering, loading states, and connection errors against a configured LM Studio instance or an appropriate mock. State when live integration was not checked.
- Review the final diff for unintended changes. Documentation-only changes do not require application tests.
