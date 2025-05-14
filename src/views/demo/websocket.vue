<template>
  <div class="websocket">
    <h1>WebSocket Demo</h1>
    <div class="message-list">
      <div v-for="(message, index) in messages" :key="index" class="message">
        {{ message }}
      </div>
    </div>
    <input v-model="inputMessage" placeholder="Type a message" />
    <button @click="sendMessage">Send</button>
  </div>
</template>

<script>
import { defineComponent, ref, onUnmounted } from "vue";
import websocket from '@/utils/websocket';
export default defineComponent({
  name: "WebSocketDemo",
  setup() {
    const messages = ref([]);
    const inputMessage = ref("");
    websocket.connect()
    
    websocket.on('echo-reply', (data) => {
      messages.value.push(data.data);
    });

    const sendMessage = () => {
      if (websocket && inputMessage.value) {
        websocket.send('send', inputMessage.value);
        inputMessage.value = "";
      }
    };

    onUnmounted(() => {
      websocket.close();
    });

    return {
      messages,
      inputMessage,
      sendMessage,
    };
  },
});

</script>
