import { fireEvent, render, screen } from '@testing-library/svelte'
import { describe, expect, it, vi } from 'vitest'
import { MODELS } from '../models'
import Header from './Header.svelte'

describe('Header', () => {
  const props = {
    modelName: 'phi-4-mini-instruct',
    modelOptions: MODELS,
  }

  it('renders the brand and status', () => {
    render(Header, { props })
    expect(screen.getByText('local')).toBeTruthy()
    expect(screen.getByText('self-hosted')).toBeTruthy()
    expect(screen.getByText('LM Studio online')).toBeTruthy()
  })

  it('shows the selected model on the chip', () => {
    render(Header, { props })
    expect(screen.getByRole('button', { name: /phi-4-mini-instruct/ })).toBeTruthy()
  })

  it('opens the listbox and shows all options', async () => {
    render(Header, { props })
    const chip = screen.getByRole('button', { name: /phi-4-mini-instruct/ })
    expect(screen.queryByRole('option')).toBeNull()
    await fireEvent.click(chip)
    expect(chip).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('selects a model and closes the menu', async () => {
    const onSelectModel = vi.fn()
    render(Header, { props: { ...props, onSelectModel } })
    await fireEvent.click(screen.getByRole('button', { name: /phi-4-mini-instruct/ }))
    await fireEvent.click(screen.getByRole('option', { name: /qwen2.5-coder-7b/ }))
    expect(onSelectModel).toHaveBeenCalledWith('qwen2.5-coder-7b')
    expect(screen.queryByRole('option')).toBeNull()
  })

  it('closes the menu on Escape', async () => {
    render(Header, { props })
    await fireEvent.click(screen.getByRole('button', { name: /phi-4-mini-instruct/ }))
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0)
    await fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('option')).toBeNull()
  })

  it('closes the menu on outside click', async () => {
    render(Header, { props })
    await fireEvent.click(screen.getByRole('button', { name: /phi-4-mini-instruct/ }))
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0)
    await fireEvent.pointerDown(document.body)
    expect(screen.queryByRole('option')).toBeNull()
  })
})