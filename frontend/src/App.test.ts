import { fireEvent, render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import App from './App.svelte'

describe('App', () => {
  it('sets the document title', () => {
    render(App)
    expect(document.title).toBe('Local — chat with your models')
  })

  it('renders the shell: topbar, message region, and composer footer', () => {
    render(App)
    expect(screen.getByRole('banner')).toBeTruthy()
    expect(screen.getByRole('heading', { name: /Everything stays here/ })).toBeTruthy()
    expect(screen.getByRole('form', { name: 'Message composer' })).toBeTruthy()
  })

  it('shows the default model in the empty state, chip, and composer hint', () => {
    render(App)
    expect(screen.getAllByText(/phi-4-mini-instruct/).length).toBeGreaterThanOrEqual(3)
    expect(screen.getByText(/answers from this machine/)).toBeTruthy()
    expect(screen.getByText(/runs on this machine/)).toBeTruthy()
  })

  it('updates the displayed model when selecting from the menu', async () => {
    render(App)
    await fireEvent.click(screen.getByRole('button', { name: /phi-4-mini-instruct/ }))
    await fireEvent.click(screen.getByRole('option', { name: /qwen2.5-coder-7b/ }))
    expect(screen.getAllByText(/qwen2.5-coder-7b/).length).toBeGreaterThanOrEqual(3)
  })
})