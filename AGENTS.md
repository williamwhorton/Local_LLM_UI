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

## Code promotion process
Every change reaches `master` through a Pull Request. The process is the same for all agents, so changes are reviewable and mergeable in small, testable steps:
1. **Branch from `master`.** Create a new branch for each work item or plan step, e.g. `feature/step-1-*`, `frontend/*`, `chore/*`, `docs/*`. Never commit directly to `master`.
2. **Complete the work on that branch.** Keep the change focused on the requested task and preserve other agents' staged, unstaged, and untracked work. Always commit (or stash) before switching branches or ending a session.
3. **Add unit tests covering the new code.** Follow the style of existing tests: backend tests are Vitest files under `src/**/*.test.ts`; frontend tests under `frontend/src/**/*.test.ts`. Go/no tests may be added alongside meaningful behavior. Documentation-only changes do not require application tests.
4. **Run the checks.** Run the relevant type check or build and the test suite for the package you changed, and report any failures accurately.
5. **Submit a Pull Request targeting `master`.** Summarize what the change does and how it was verified.
6. **Get the PR reviewed and merged.** The repository's designated review agent evaluates the change (see "Code review" below) and either approves and merges it or requests changes. Do not self-merge your own PR, and do not review your own work.

### Code review
The maintainer has delegated PR review and merging to a designated **review agent** (the agent that acts as this repository's reviewer). For every PR targeting `master`, the review agent:
- Pulls the branch and reviews the diff against `master` for correctness, scope, and adherence to the conventions above.
- Verifies with the checks: runs the type check or build and the relevant test suite when behavior changed, and confirms the PR adds unit tests covering the change (documentation-only changes are exempt).
- Never merges a PR that fails checks, is missing required tests, or changes more than its stated scope.

Outcomes:
- **Approved and merged:** the review agent merges the PR into `master`, removes the now-merged branch, and notifies the maintainer with the PR number, a short summary, and how it was verified.
- **Changes requested:** the review agent posts a review comment listing the specific required fixes and notifies the agent that owns the PR (the branch author) directly so they can update and resubmit.

### Working in parallel
Multiple agents work on separate branches at the same time. To avoid collisions, conflicts, or overwritten code:
- Prefer one `git worktree` per branch so files on disk, `node_modules`, build artifacts, and uncommitted edits cannot collide (`git worktree add ../llm-ui-<branchOrAgent> <branch>`). Only the primary worktree holds `.idea/`.
- Keep `node_modules` and lockfiles inside each worktree. Ignore files are per-package: root `.gitignore` covers backend output and secrets; each package (e.g. `frontend/.gitignore`) ignores its own `node_modules/`, `dist/`, and `.env`. Check `git status` after builds and never stage ignored artifacts.
- Agents running dev servers at the same time must not share ports (backend defaults to `127.0.0.1:3000`, Vite to `5173`); override `HOST`/`PORT` per run via a local, gitignored `.env`.
- Shared files need discipline: update `package.json` and `bun.lock` together (reconcile with `bun install` when branches both add dependencies); update status notes in `agents/documentation/plan.md` and `roadmap.md` only on the branch that owns the change; avoid editing files another agent is actively working on.
- The designated review agent works from `master` in the primary worktree, so feature branches are never blocked by the reviewer; agents coordinate with the reviewer before merging.

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
