<template>
  <div class="websocket">
    <a-alert message="需开启node.js服务" type="warning" />
    <div class="send">
      <a-input v-model:value="inputMessage" placeholder="输入信息" />
      <a-button @click="sendMessage">发送</a-button>
    </div>
    <div class="receive">
      <div class="title">接收信息</div>
      <div class="message-list">
        <div v-for="(message, index) in messages" :key="index" class="message">
          {{ message }}
        </div>
      </div>
    </div>
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

<style lang="less" scoped>
.websocket {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap:16px;
  .send {
    display: flex;
    gap: 8px;
  }
  .receive {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .message {
    width: 200px;
    height: 36px;
    line-height: 36px;
    text-align: center;
    border: 1px solid #ccc;
    margin-bottom: 4px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
</style>