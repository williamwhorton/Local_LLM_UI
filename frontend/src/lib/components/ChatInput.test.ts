import { fireEvent, render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import ChatInput from './ChatInput.svelte'

describe('ChatInput', () => {
  it('renders a labeled composer form, textarea, and hints', () => {
    render(ChatInput, { props: { modelName: 'phi-4-mini-instruct' } })
    expect(screen.getByRole('form', { name: 'Message composer' })).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'Message' })).toBeTruthy()
    expect(screen.getByText('Enter to send · Shift+Enter for a new line')).toBeTruthy()
    expect(screen.getByText(/phi-4-mini-instruct · runs on this machine/)).toBeTruthy()
  })

  it('disables send while empty and enables it after typing', async () => {
    render(ChatInput, { props: { modelName: 'phi-4-mini-instruct' } })
    const send = screen.getByRole('button', { name: 'Send message' })
    expect(send).toBeDisabled()
    const textarea = screen.getByRole('textbox', { name: 'Message' })
    await fireEvent.input(textarea, { target: { value: 'hello' } })
    expect(send).toBeEnabled()
    await fireEvent.input(textarea, { target: { value: '   ' } })
    expect(send).toBeDisabled()
  })

  it('does not throw when the form is submitted', () => {
    render(ChatInput, { props: { modelName: 'phi-4-mini-instruct' } })
    const form = screen.getByRole('form', { name: 'Message composer' })
    expect(() => fireEvent.submit(form)).not.toThrow()
  })
})