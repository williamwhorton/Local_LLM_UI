# Project Plan: LM Studio Chat SPA

## Overview
Development of a Single Page Application (SPA) designed to serve as a lightweight web interface for an LLM running on LM Studio. The application will consist of a Node.js backend acting as a proxy and a modern frontend for user interaction.

## High-Level Architecture

```mermaid
graph LR
    subgraph "Client (Web Browser)"
        UI[Frontend UI: Chat Window & Input]
        StreamListener[SSE/WebSocket Listener]
    end

    subgraph "Backend (Node.js Server)"
        API_Proxy[API Proxy & Router]
        Auth_Handler[LM Studio API Key Handler]
        Stream_Forwarder[Response Stream Forwarder]
        Static_Server[Static File Server - Frontend Assets]
    end

    subgraph "External Service"
        LMStudio[LM Studio Server]
    end

    UI --> API_Proxy
    API_Proxy --> Auth_Handler
    Auth_Handler --> Stream_Forwarder
    Stream_Forwarder --> LMStudio
    LMStudio -- Streaming Response --> Stream_Forwarder
    Stream_Forwarder -- EventStream/Chunked Transfer --> StreamListener
    StreamListener --> UI
    Static_Server --> UI
```

## Development Plan

### Phase 1: Backend Foundation
1.  **Environment Setup**: Initialize Node.js project and install core dependencies (proxy, server framework).
2.  **Static File Serving**: Implement the ability to serve pre-built frontend assets from a `public` directory.
3.  **LM Studio Integration**:
    *   Implement request forwarding logic.
    *   Configure API Key header injection for LM Studio authentication.
4.  **Streaming Implementation**: 
    *   Set up Server-Sent Events (SSE) or Chunked Transfer Encoding to relay chunks from the LM Studio response stream directly to the client.

### Phase 2: Frontend Development
1.  **UI Scaffolding**: Create a basic layout with a scrollable message area and a fixed bottom input bar.
2.  **State Management**: Implement logic to manage the conversation history array (user messages vs. assistant messages).
3.  **Streaming Client Logic**: 
    *   Use `fetch` API with `ReadableStream` or an `EventSource` listener to process incoming text chunks.
      * Ensure UI updates incrementally as tokens arrive.
4.  **Input Handling**: Implement message submission, loading states (typing indicators), and auto-scrolling behavior.

### Phase 3: Integration & Testing
1.  **End-to-End Testing**: Verify that a prompt sent from the browser correctly triggers an LM Studio inference and streams back to the UI.
2.  **Error Handling**: Implement error boundaries for backend connectivity issues (e.g., LM Studio server down).

## Framework Suggestions

### Backend (Node.js)

| Framework | Pros | Cons |
| :--- | :--- | :--- |
| **Express.js** | Industry standard, massive ecosystem of middleware, extremely easy to learn and implement. | Slower performance compared to newer alternatives; requires more manual configuration for modern streaming patterns. |
| **Fastify** | Extremely high performance; built-in support for JSON schema validation and excellent handling of streams/payloads. | Slightly steeper learning curve than Express; smaller ecosystem of specialized plugins. |

**Recommendation**: **Fastify** is preferred here due to its superior performance with streaming data and modern architecture, which aligns well with the "proxying" nature of this task.

### Frontend (SPA)

| Framework | Pros | Cons |
| :--- | :--- | :--- |
| **React** | Largest ecosystem; powerful hooks (`useReducer`, `useEffect`) for managing complex streaming state. | Higher boilerplate/complexity; requires more architectural decisions (e.g., choosing a state management lib). |
| **Vue.js** | Very approachable; excellent reactivity system that makes updating the UI with incoming chunks intuitive. | Slightly smaller ecosystem than React for highly specialized streaming components. |
| **Svelte** | Minimal boilerplate; compiles away the framework, resulting in extremely lightweight and fast bundles (perfect for LAN). | Smallest ecosystem of the three; fewer pre-made component libraries. |

**Recommendation**: **Svelte** is recommended. Since this is a simple utility app for LAN use, Svelte's minimal overhead, high performance, and simplicity in managing reactive text streams make it the most efficient choice.
