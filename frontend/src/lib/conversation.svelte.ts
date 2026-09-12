export type MessageRole = 'user' | 'assistant'
export type MessageStatus = 'active' | 'complete' | 'stopped'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  status: MessageStatus
}

let nextId = 0

function createId(): string {
  nextId += 1
  return `msg-${nextId}`
}

export class Conversation {
  messages = $state<ChatMessage[]>([])

  get lastMessage(): ChatMessage | undefined {
    return this.messages.at(-1)
  }

  addUserMessage(content: string): ChatMessage {
    this.messages.push({ id: createId(), role: 'user', content, status: 'complete' })
    return this.messages.at(-1)!
  }

  addAssistantMessage(content = '', status: MessageStatus = 'active'): ChatMessage {
    this.messages.push({ id: createId(), role: 'assistant', content, status })
    return this.messages.at(-1)!
  }

  setAssistantContent(id: string, content: string): void {
    const message = this.messages.find((m) => m.id === id)
    if (message && message.role === 'assistant') {
      message.content = content
    }
  }

  setStatus(id: string, status: MessageStatus): void {
    const message = this.messages.find((m) => m.id === id)
    if (message) {
      message.status = status
    }
  }

  complete(id: string): void {
    this.setStatus(id, 'complete')
  }

  stop(id: string): void {
    this.setStatus(id, 'stopped')
  }

  regenerate(id: string): void {
    const message = this.messages.find((m) => m.id === id)
    if (message && message.role === 'assistant') {
      message.content = ''
      message.status = 'active'
    }
  }

  clear(): void {
    this.messages = []
  }
}