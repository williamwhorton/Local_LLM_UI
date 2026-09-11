import { render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import MessageList from './MessageList.svelte'

describe('MessageList', () => {
  it('exposes a live region labelled as chat messages', () => {
    render(MessageList, { props: { modelName: 'phi-4-mini-instruct' } })
    const region = screen.getByRole('region', { name: 'Chat messages' })
    expect(region).toHaveAttribute('aria-live', 'polite')
  })

  it('shows the empty-state title and model-aware subline', () => {
    render(MessageList, { props: { modelName: 'phi-4-mini-instruct' } })
    expect(screen.getByRole('heading', { name: /Everything stays here/i })).toBeTruthy()
    expect(screen.getByText(/phi-4-mini-instruct answers from this machine/)).toBeTruthy()
  })

  it('renders three suggested prompt chips', () => {
    render(MessageList, { props: { modelName: 'phi-4-mini-instruct' } })
    expect(screen.getAllByRole('button', { name: /blog titles/ })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: /API key safe/ })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: /weekend plan/ })).toHaveLength(1)
  })
})