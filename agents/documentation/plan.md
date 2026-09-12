# Project Plan: LM Studio Chat SPA

## 1. High-Level Architecture

The application follows a **Proxy-Client architecture** to bridge the gap between the web browser and the local LLM server, enabling streaming capabilities and secure API key handling.

```mermaid
graph LR
    subgraph "Local Area Network (LAN)"
        UserBrowser[Web Browser / SPA] -- "1. HTTP POST (Text/Stream)" --> NodeBackend[Node.js Backend]
        NodeBackend -- "2. HTTP POST + Auth (Stream)" --> LMStudio[LM Studio Server]
    end
    
    subgraph "Configuration"
        EnvVars[Environment Variables: API_KEY, LM_STUDIO_URL] --> NodeBackend
    end
```

### Data Flow
1.  **User Input:** User types a message in the SPA and hits send.
2.  **Request Proxying:** The SPA sends an HTTP request to the Node.js backend.
3.  **Authenticated Upstream Request:** The Node.js backend attaches the `Authorization: Bearer <API_KEY>` header and forwards the request to the LM Studio endpoint.
4.  **Stream Forwarding:** As LM Studio generates tokens, the Node.js backend pipes the incoming stream directly back to the SPA using **Server-Sent Events (SSE)** or a standard **Fetch ReadableStream**.
5.  **UI Update:** The SPA parses the incoming chunks and updates the conversation history window in real-time.

---

## 2. Technology Stack Recommendations

### Backend: Node.js
I recommend **Fastify** for this specific use case.

| Framework | Pros | Cons |
| :--- | :--- | :--- |
| Fastify | much faster than Express; excellent support for asynchronous streams (crucial for LLM responses). | Slightly different syntax/plugin-based architecture compared to the traditional Express pattern. |
| Express | Industry standard, massive middleware ecosystem, very easy to find documentation. | Slower overhead; handling high-frequency streaming chunks is less efficient than Fastify. |

### Frontend: SPA Framework
I recommend **Svelte** or **React**.

| Framework | Pros | Cons |
| :--- | :--- | :--- |
| Svelte | Minimal boilerplate, extremely lightweight, and excellent "reactive" primitives that make updating a chat window with incoming tokens very simple. | Smaller ecosystem/community compared to React. |
| React | Mature ecosystem, powerful state management (Hooks), perfect for complex UI components. | Higher complexity due to the Virtual DOM and more boilerplate code for managing stream-based state updates. |

### Communication Protocol
*   **Backend $\to$ LM Studio:** Standard HTTP `fetch` with `stream: true`.
*   **SPA $\to$ Backend:** **Server-Sent Events (SSE)** or **Fetch API with ReadableStream**. SSE is highly reliable for one-way text streaming from server to client.

---

## 3. Implementation Roadmap

### Phase 1: Backend Foundation
> **Status:** Step 1 (server setup + environment configuration) is done. Steps below are implemented on `feature/step-*` branches merged to `master` after review.

- [x] **Environment Configuration:** Setup `.env` for `LM_STUDIO_URL` and `LM_STUDIO_API_KEY`. Implemented in `src/config.ts`, validated at startup (`src/server.ts`), with `HOST`, `PORT`, and `CORS_ORIGIN` also configurable (see `.env.example`).
- [x] **Server Setup:** Initialize Fastify server with CORS enabled (to allow LAN access). Implemented in `src/app.ts`; exposes `GET /health`.
- [ ] **Proxy Implementation:** Create a POST endpoint `/api/chat` that uses `undici` or `node-fetch` to forward requests to LM Studio.
- [ ] **Stream Piping:** Implement the logic to capture the `ReadableStream` from the upstream response and pipe it into the downstream response object.

### Phase 2: Frontend Development
> **Status**: Step 1 (UI skeleton) is **COMPLETE** (merged, branch `frontend/ui-scaffolding`).
> Built against the approved design system in `agents/documentation/design.md`
> (visual reference: `design/mockup.html`) — app name "Local", warm charcoal/paper
> palette with a single ember accent, dark default with light theme via
> `prefers-color-scheme`, and `prefers-reduced-motion` honored. The Svelte 5 shell
> (`App.svelte`) wires a topbar (`Header` with model-selector popover and status),
> a scrollable message region, and the composer footer (`ChatInput` with hints and
> a disabled-when-empty send button).
>
> **Step 2 (State Management): COMPLETE** on branch `frontend/step-2-state`.
> Added `frontend/src/lib/conversation.svelte.ts`: a Svelte 5 runes `Conversation`
> store holding the history array of `ChatMessage` objects (`role: 'user' |
> 'assistant'`, `status: 'active' | 'complete' | 'stopped'`) with an API for
> appending user/assistant messages, streamed-content updates, complete/stop,
> regenerate, and clear. `App.svelte` owns a `Conversation` instance and passes
> `messages` into `MessageList`, which now renders the thread (day divider,
> assistant avatar + bubble, right-aligned user bubbles, `pre-wrap` text, blinking
> caret for `active`, dashed "Generation stopped" pill for `stopped`) while the
> empty state still shows for a fresh conversation. Markdown-lite `format.ts`,
> streaming (`stream.ts`), and send/stop orchestration remain future (Steps 3–4).
> Backend Phase 1 foundation lives on `feature/step-*` branches; the proxy and
> streaming endpoints are not implemented yet.

**Decisions (Phase 2):** Svelte 5 + Vite in a standalone `frontend/` subproject (own `package.json`, lockfile, tsconfig, Vitest/jsdom suite). Conversation history is a runes store (`conversation.svelte.ts`) with user/assistant messages and per-message status, owned by `App` and consumed by `MessageList`; streaming content mutates the active assistant message in place. Communication protocol between SPA and backend is undecided (SSE vs Fetch `ReadableStream`).

*   **State Management:** Implement reactive state to append new tokens to the "current" message in the history without re-rendering the entire list. *(Step 2 complete — `Conversation` store + thread rendering; token appends land with Step 3.)*
*   **UI Skeleton:** Create the chat window container, message bubbles (User vs. Assistant), and a sticky bottom input area. *(Step 1 complete — shell and empty state per the design system; bubbles now render in Step 2.)*
*   **Streaming Logic:** Implement a service to call the backend API using `fetch`. Use the `ReadableStream` interface to iterate over chunks as they arrive.

### Phase 3: LAN Deployment & Testing
*   **Network Binding:** Configure the Node.js server to listen on `0.0.0.0` instead of `localhost`.
*   **Integration Test:** Verify that a request sent from a different device on the same WiFi/LAN correctly reaches the backend and receives the streamed response.
