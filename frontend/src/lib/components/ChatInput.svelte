<script lang="ts">
  interface $Props {
    modelName: string
  }

  let { modelName }: $Props = $props()

  let value = $state('')
  const empty = $derived(value.trim() === '')
</script>

<form
  class="composer"
  aria-label="Message composer"
  onsubmit={(event) => event.preventDefault()}
>
  <textarea
    id="message-input"
    rows="1"
    placeholder="Type a message…"
    aria-label="Message"
    bind:value
  ></textarea>
  <button class="send" type="submit" aria-label="Send message" disabled={empty}>
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </svg>
  </button>
</form>
<div class="hints">
  <span class="hint">Enter to send · Shift+Enter for a new line</span>
  <span class="hint model-hint">
    <span class="ok-dot" aria-hidden="true"></span>
    {modelName} · runs on this machine
  </span>
</div>

<style>
  .composer {
    display: flex;
    align-items: flex-end;
    gap: 0.6rem;
    padding: 0.55rem 0.6rem 0.55rem 0.95rem;
    border: 1px solid var(--border);
    border-radius: 1.35rem;
    background: var(--surface);
    box-shadow: 0 14px 44px color-mix(in srgb, var(--bg) 62%, transparent);
  }

  .composer:focus-within {
    border-color: color-mix(in srgb, var(--accent) 55%, var(--border));
    box-shadow: 0 0 0 4px var(--focus-ring);
  }

  textarea {
    flex: 1 1 auto;
    min-width: 0;
    max-height: 9rem;
    border: none;
    background: transparent;
    color: var(--text);
    font: inherit;
    font-size: 0.95rem;
    line-height: 1.55;
    resize: none;
    padding: 0.35rem 0;
  }

  textarea:focus {
    outline: none;
  }

  .send {
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.9rem;
    border: none;
    background: var(--accent-gradient);
    color: var(--accent-ink);
    display: grid;
    place-items: center;
  }

  .send:disabled {
    opacity: 0.36;
    cursor: not-allowed;
  }

  .hints {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 0.5rem;
    padding: 0 0.4rem;
    font-size: 0.68rem;
    color: var(--text-3);
  }

  .hint {
    white-space: nowrap;
  }

  .model-hint {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  .ok-dot {
    width: 0.45rem;
    height: 0.45rem;
    border-radius: 50%;
    background: var(--success);
  }
</style>