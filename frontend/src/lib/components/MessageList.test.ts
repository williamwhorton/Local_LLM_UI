import { render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import type { ChatMessage } from '../conversation.svelte'
import MessageList from './MessageList.svelte'

const PROPS = { modelName: 'phi-4-mini-instruct', messages: [] as ChatMessage[] }

function sampleMessages(): ChatMessage[] {
  return [
    { id: 'm1', role: 'user', content: 'Write a haiku', status: 'complete' },
    { id: 'm2', role: 'assistant', content: 'rain, then quiet sun', status: 'complete' },
    { id: 'm3', role: 'user', content: 'Longer version?', status: 'complete' },
    { id: 'm4', role: 'assistant', content: 'gray morning', status: 'active' },
    { id: 'm5', role: 'assistant', content: 'stopped partial', status: 'stopped' },
  ]
}

describe('MessageList', () => {
  it('exposes a live region labelled as chat messages', () => {
    render(MessageList, { props: PROPS })
    const region = screen.getByRole('region', { name: 'Chat messages' })
    expect(region).toHaveAttribute('aria-live', 'polite')
  })

  it('shows the empty-state title and model-aware subline when there are no messages', () => {
    render(MessageList, { props: PROPS })
    expect(screen.getByRole('heading', { name: /Everything stays here/i })).toBeTruthy()
    expect(screen.getByText(/phi-4-mini-instruct answers from this machine/)).toBeTruthy()
  })

  it('renders three suggested prompt chips when empty', () => {
    render(MessageList, { props: PROPS })
    expect(screen.getAllByRole('button', { name: /blog titles/ })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: /API key safe/ })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: /weekend plan/ })).toHaveLength(1)
  })

  it('hides the empty state and renders the thread when messages exist', () => {
    const { container } = render(MessageList, {
      props: { modelName: 'phi-4-mini-instruct', messages: sampleMessages() },
    })
    expect(screen.queryByRole('heading', { name: /Everything stays here/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /blog titles/ })).toBeNull()
    expect(screen.getByText('Today')).toBeTruthy()
    expect(container.querySelectorAll('.row')).toHaveLength(5)
  })

  it('renders user rows in the user bubble and assistant rows with an avatar', () => {
    const { container } = render(MessageList, {
      props: { modelName: 'phi-4-mini-instruct', messages: sampleMessages() },
    })
    const userBubble = container.querySelector('.row.user .bubble.user .text')
    expect(userBubble?.textContent).toBe('Write a haiku')
    expect(container.querySelectorAll('.row.assistant .avatar')).toHaveLength(3)
    expect(container.querySelectorAll('.row.assistant .bubble.assistant')).toHaveLength(3)
  })

  it('shows a streaming caret for active assistant messages', () => {
    const { container } = render(MessageList, {
      props: { modelName: 'phi-4-mini-instruct', messages: sampleMessages() },
    })
    expect(container.querySelector('.caret')).toBeTruthy()
  })

  it('shows the stopped pill for stopped assistant messages', () => {
    render(MessageList, {
      props: { modelName: 'phi-4-mini-instruct', messages: sampleMessages() },
    })
    expect(screen.getByText('Generation stopped')).toBeTruthy()
  })

  it('keeps bubble text raw (pre-wrap) for active and stopped messages', () => {
    const { container } = render(MessageList, {
      props: { modelName: 'phi-4-mini-instruct', messages: sampleMessages() },
    })
    const activeText = container.querySelector('.caret')?.closest('.text')
    expect(activeText?.textContent).toContain('gray morning')
  })
})