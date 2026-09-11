# Repository guidance

## Current state and scope
- This repository is a LAN-accessible LM Studio chat SPA in incremental development.
- The backend (`src/`) is a Fastify server foundation: configuration loader, CORS, and a `/health` route. The LM Studio proxy and streaming endpoints are not implemented yet.
- The frontend lives in `frontend/` and is a Svelte 5 + Vite single-page app. Phase 2 step 1 (UI scaffolding: scrollable message area + fixed bottom input bar) is implemented and unit-tested.
- Read `agents/documentation/plan.md` and `agents/documentation/roadmap.md` before architecture work. They describe intended behavior and recommendations; treat their "Status" notes as the source of truth for what is done.
- The plans recommend a Node.js proxy backend (Fastify, already chosen) and a Svelte frontend (Svelte 5, already chosen). Keep implementation choices explicit and update the plans when decisions change.

## Repository map
- `src/`: TypeScript backend source included by the compiler.
- `frontend/`: standalone Svelte 5 + Vite app with its own `package.json`, `bun.lock`, `tsconfig.json`, and test suite.
- `package.json`: backend package metadata, dependencies, and scripts.
- `tsconfig.json`: strict TypeScript configuration; ES2016 target, CommonJS modules, output in `dist/`.
- `bun.lock`: backend dependency lockfile. Use Bun for dependency management and keep this file synchronized with package changes.
- `vitest.config.mts`: backend test configuration.
- `agents/documentation/`: project architecture and implementation plans.
- `.idea/`: IDE metadata; avoid unrelated changes here.

## Development commands
Run backend commands from the repository root:
- `bun install`: install dependencies.
- `bun run build`: compile TypeScript with the configured `tsc` script.
- `bun run build --noEmit`: check types without generating output.
- `bun run test`: run the backend Vitest suite.
- `bun run dev`: start the Fastify dev server with `bun --watch`.

The frontend is a separate package. Run these from `frontend/`:
- `bun install`: install frontend dependencies.
- `bun run dev`: start the Vite dev server.
- `bun run build`: produce static assets in `frontend/dist/`.
- `bun run check`: run `svelte-check` types and diagnostics.
- `bun run test`: run the frontend Vitest suite (jsdom).
- `bun run preview`: serve the production build locally.

## Implementation conventions
- Keep application code in TypeScript with strict checking enabled. Follow nearby code style and avoid unrelated formatting changes.
- Keep changes focused on the requested task and preserve existing staged, unstaged, and untracked user work.
- Add dependencies only when needed for the implementation; update `package.json` and `bun.lock` together.
- Do not hand-edit generated compiler output or commit `node_modules/` or `dist/`. The ignore file excludes `dist/` and `frontend/dist/`; check the working tree after builds.
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
