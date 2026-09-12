<script lang="ts">
  import { Conversation } from './lib/conversation.svelte'
  import ChatInput from './lib/components/ChatInput.svelte'
  import Header from './lib/components/Header.svelte'
  import MessageList from './lib/components/MessageList.svelte'
  import { MODELS } from './lib/models'

  let modelName = $state(MODELS[0].name)
  const conversation = new Conversation()
</script>

<svelte:head>
  <title>Local — chat with your models</title>
</svelte:head>

<div class="shell">
  <Header modelName={modelName} modelOptions={MODELS} onSelectModel={(name) => (modelName = name)} />

  <main class="main">
    <MessageList {modelName} messages={conversation.messages} />
  </main>

  <footer class="footer">
    <ChatInput {modelName} />
  </footer>
</div>

<style>
  .shell {
    position: relative;
    z-index: 1;
    height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  .main {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    position: relative;
  }

  .footer {
    flex: 0 0 auto;
    width: 100%;
    max-width: 46rem;
    margin: 0 auto;
    padding: 0.85rem 1.25rem calc(0.9rem + env(safe-area-inset-bottom));
  }
</style>