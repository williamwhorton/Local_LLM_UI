<script lang="ts">
  import type { ModelOption } from '../types'

  interface $Props {
    modelName: string
    modelOptions: ModelOption[]
    onSelectModel?: (name: string) => void
  }

  let { modelName, modelOptions, onSelectModel = () => {} }: $Props = $props()

  let open = $state(false)

  function toggle() {
    open = !open
  }

  function select(name: string) {
    onSelectModel(name)
    open = false
  }

  $effect(() => {
    if (!open) return
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') open = false
    }
    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  })

  function clickOutside(node: HTMLElement, close: () => void) {
    function onPointerDown(event: PointerEvent) {
      if (!node.contains(event.target as Node)) close()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return {
      destroy() {
        document.removeEventListener('pointerdown', onPointerDown, true)
      },
    }
  }
</script>

<header class="topbar">
  <div class="topbar-inner">
    <div class="brand">
      <span class="brand-mark" aria-hidden="true">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 3c.35 4.3 1.85 5.8 6 6-4.15.2-5.65 1.7-6 6-.35-4.3-1.85-5.8-6-6 4.15-.2 5.65-1.7 6-6z"
          />
        </svg>
      </span>
      <span class="brand-name">local</span>
      <span class="brand-tag">self-hosted</span>
    </div>

    <div class="topbar-actions">
      <div class="model-selector" use:clickOutside={() => (open = false)}>
        <button
          class="model-chip"
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onclick={toggle}
        >
          <svg
            class="chip-icon"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3l9 5-9 5-9-5 9-5z" />
            <path d="M3 13l9 5 9-5" />
          </svg>
          <span>{modelName}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {#if open}
          <div class="menu" role="listbox" aria-label="Available models">
            {#each modelOptions as option (option.name)}
              <button
                class="option"
                type="button"
                role="option"
                aria-selected={option.name === modelName}
                onclick={() => select(option.name)}
              >
                <span class="option-name">{option.name}</span>
                <span class="option-tagline">{option.tagline}</span>
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <div class="status" title="LM Studio connection" aria-live="polite">
        <span class="status-dot" aria-hidden="true"></span>
        <span class="status-label">LM Studio online</span>
      </div>
    </div>
  </div>
</header>

<style>
  .topbar {
    flex: 0 0 auto;
    position: sticky;
    top: 0;
    z-index: 40;
    border-bottom: 1px solid var(--border);
    background: color-mix(in srgb, var(--bg) 74%, transparent);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }

  .topbar-inner {
    max-width: 52rem;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.7rem 1.25rem;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .brand-mark {
    width: 1.9rem;
    height: 1.9rem;
    border-radius: 0.65rem;
    background: var(--accent-gradient);
    color: var(--accent-ink);
    display: grid;
    place-items: center;
    box-shadow: 0 6px 20px color-mix(in srgb, var(--accent) 35%, transparent);
  }

  .brand-name {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .brand-tag {
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-3);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 0.28rem 0.55rem;
  }

  .topbar-actions {
    display: flex;
    align-items: center;
    gap: 0.9rem;
  }

  .model-selector {
    position: relative;
  }

  .model-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    height: 2.1rem;
    padding: 0 0.65rem 0 0.75rem;
    border-radius: 0.8rem;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-2);
    font-size: 0.8rem;
  }

  .model-chip .chip-icon {
    color: var(--accent);
  }

  .menu {
    position: absolute;
    top: calc(100% + 0.4rem);
    right: 0;
    z-index: 50;
    min-width: 16rem;
    padding: 0.35rem;
    border: 1px solid var(--border-strong);
    border-radius: 0.9rem;
    background: var(--surface-2);
    box-shadow: var(--shadow-pop);
  }

  .option {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.05rem;
    width: 100%;
    padding: 0.5rem 0.7rem;
    border: none;
    border-radius: 0.6rem;
    background: transparent;
    text-align: left;
  }

  .option:hover,
  .option:focus-visible {
    background: var(--surface-3);
  }

  .option[aria-selected='true'] {
    background: var(--accent-soft);
  }

  .option[aria-selected='true'] .option-name {
    color: var(--accent);
  }

  .option-name {
    color: var(--text);
    font-size: 0.8rem;
    font-weight: 600;
  }

  .option-tagline {
    color: var(--text-3);
    font-size: 0.7rem;
  }

  .status {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.74rem;
    color: var(--text-2);
    white-space: nowrap;
  }

  .status-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--success);
    animation: pulse 2.4s ease-out infinite;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--success) 50%, transparent);
    }
    70% {
      box-shadow: 0 0 0 0.45rem transparent;
    }
    100% {
      box-shadow: 0 0 0 0 transparent;
    }
  }

  @media (max-width: 600px) {
    .status-label,
    .brand-tag {
      display: none;
    }
  }
</style>