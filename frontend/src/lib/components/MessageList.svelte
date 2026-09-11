<script lang="ts">
  interface $Props {
    modelName: string
  }

  let { modelName }: $Props = $props()
</script>

<div class="inner">
  <section class="empty-state" aria-label="Chat messages" aria-live="polite">
    <div class="glow" aria-hidden="true"></div>
    <div class="empty-mark" aria-hidden="true">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M12 3c.35 4.3 1.85 5.8 6 6-4.15.2-5.65 1.7-6 6-.35-4.3-1.85-5.8-6-6 4.15-.2 5.65-1.7 6-6z"
        />
      </svg>
    </div>
    <h1 class="empty-title">Everything stays <em>here</em>.</h1>
    <p class="empty-sub">
      {modelName} answers from this machine. The browser only talks to the proxy on your LAN.
    </p>
    <div class="suggestions">
      <button class="chip" type="button">
        Brainstorm ten blog titles about self-hosting AI
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="M13 6l6 6-6 6" />
        </svg>
      </button>
      <button class="chip" type="button">
        Explain how a local LLM proxy keeps my API key safe
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="M13 6l6 6-6 6" />
        </svg>
      </button>
      <button class="chip" type="button">
        Help me sketch a weekend plan for a LAN chat UI
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="M13 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  </section>
</div>

<style>
  .inner {
    max-width: 46rem;
    margin: 0 auto;
    padding: 0 1.25rem 1.75rem;
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }

  .empty-state {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 3rem 0.5rem;
  }

  .glow {
    position: absolute;
    top: 6%;
    left: 50%;
    width: 26rem;
    height: 16rem;
    transform: translateX(-50%);
    background: radial-gradient(closest-side, var(--accent-soft), transparent 72%);
    filter: blur(18px);
    pointer-events: none;
    animation: float 9s ease-in-out infinite;
  }

  @keyframes float {
    50% {
      transform: translateX(-50%) translateY(-12px);
    }
  }

  .empty-mark {
    position: relative;
    z-index: 1;
    width: 3.3rem;
    height: 3.3rem;
    border-radius: 1.05rem;
    background: var(--accent-gradient);
    color: var(--accent-ink);
    display: grid;
    place-items: center;
    box-shadow: 0 16px 44px color-mix(in srgb, var(--accent) 40%, transparent);
    margin-bottom: 1.4rem;
  }

  .empty-title {
    position: relative;
    z-index: 1;
    font-family: var(--font-display);
    font-weight: 420;
    font-size: clamp(1.9rem, 4.5vw, 2.55rem);
    letter-spacing: -0.02em;
    line-height: 1.15;
    margin: 0 0 0.6rem;
    color: var(--text);
  }

  .empty-title em {
    font-style: italic;
    background: var(--accent-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .empty-sub {
    position: relative;
    z-index: 1;
    color: var(--text-2);
    font-size: 0.95rem;
    line-height: 1.7;
    max-width: 25rem;
    margin: 0 0 1.7rem;
  }

  .suggestions {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
    justify-content: center;
    max-width: 34rem;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 0.95rem;
    border-radius: 999px;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-2);
    font-size: 0.82rem;
    text-align: left;
  }

  .chip svg {
    color: var(--accent);
  }

  .chip:hover {
    border-color: color-mix(in srgb, var(--accent) 55%, var(--border));
    transform: translateY(-1px);
  }
</style>