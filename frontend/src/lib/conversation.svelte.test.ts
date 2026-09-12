import { describe, expect, it } from 'vitest'
import { Conversation, type ChatMessage } from './conversation.svelte'

describe('Conversation', () => {
  it('starts empty', () => {
    const conversation = new Conversation()
    expect(conversation.messages).toHaveLength(0)
    expect(conversation.lastMessage).toBeUndefined()
  })

  it('appends a complete user message with a unique id', () => {
    const conversation = new Conversation()
    const first = conversation.addUserMessage('Hello')
    const second = conversation.addUserMessage('World')
    expect(conversation.messages).toHaveLength(2)
    expect(first.role).toBe('user')
    expect(first.content).toBe('Hello')
    expect(first.status).toBe('complete')
    expect(first.id).not.toBe(second.id)
  })

  it('appends an assistant message that defaults to an active stream', () => {
    const conversation = new Conversation()
    const message = conversation.addAssistantMessage()
    expect(message.role).toBe('assistant')
    expect(message.content).toBe('')
    expect(message.status).toBe('active')
    expect(conversation.lastMessage).toBe(message)
  })

  it('appends an assistant message with custom content and status', () => {
    const conversation = new Conversation()
    const message = conversation.addAssistantMessage('Done', 'complete')
    expect(message.content).toBe('Done')
    expect(message.status).toBe('complete')
  })

  it('keeps user and assistant messages in insertion order', () => {
    const conversation = new Conversation()
    const user = conversation.addUserMessage('Hi')
    const assistant = conversation.addAssistantMessage('Hey')
    expect(conversation.messages.map((m) => m.role)).toEqual(['user', 'assistant'])
    expect(conversation.messages[0]).toBe(user)
    expect(conversation.messages[1]).toBe(assistant)
  })

  it('updates assistant content for streamed text by id', () => {
    const conversation = new Conversation()
    conversation.addUserMessage('Write a haiku')
    const assistant = conversation.addAssistantMessage()
    conversation.setAssistantContent(assistant.id, 'Rain on the window')
    expect(conversation.messages[1].content).toBe('Rain on the window')
  })

  it('ignores content updates for missing ids and user messages', () => {
    const conversation = new Conversation()
    const user = conversation.addUserMessage('Hello')
    conversation.setAssistantContent(user.id, 'nope')
    conversation.setAssistantContent('does-not-exist', 'nope')
    expect(user.content).toBe('Hello')
  })

  it('transitions status via complete and stop', () => {
    const conversation = new Conversation()
    const message = conversation.addAssistantMessage('partial')
    conversation.complete(message.id)
    expect(conversation.messages[0].status).toBe('complete')
    conversation.stop(message.id)
    expect(conversation.messages[0].status).toBe('stopped')
  })

  it('restarts an assistant message for regeneration', () => {
    const conversation = new Conversation()
    const message = conversation.addAssistantMessage('old answer', 'complete')
    conversation.regenerate(message.id)
    expect(message.content).toBe('')
    expect(message.status).toBe('active')
  })

  it('clears all messages', () => {
    const conversation = new Conversation()
    conversation.addUserMessage('Hello')
    conversation.addAssistantMessage()
    conversation.clear()
    expect(conversation.messages).toHaveLength(0)
  })

  it('exposes a readonly-safe ChatMessage shape', () => {
    const message: ChatMessage = { id: '1', role: 'assistant', content: '', status: 'active' }
    expect(message.role).toBe('assistant')
  })
})