class WebSocketService {
  constructor() {
    this.listeners = {};
    this.reconnectDelay = 5000; // 重连延迟 5秒
  }

  connect() {
    if(process.env.NODE_ENV === 'production') this.socket = new WebSocket('/ws');
    else if(process.env.NODE_ENV === 'development') this.socket = new WebSocket(`ws://localhost:3000`);
    
    this.socket.onopen = () => {
      console.log('WebSocket连接创建成功');
    };
    
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (this.listeners[data.type]) {
        this.listeners[data.type].forEach(callback => callback(data));
      }
    };
    
    this.socket.onclose = (event) => {
      if (event.code === 1000) {
        console.log('WebSocket连接正常关闭');
      } else {
        console.log('WebSocket连接关闭，尝试重连...');
        setTimeout(() => this.connect(), this.reconnectDelay);
      }
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket错误:', error);
    };
  }

  send(type, data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }));
    } else {
      console.error('WebSocket未连接，无法发送消息');
    }
  }

  on(type, callback) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
  }

  off(type, callback) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(cb => cb !== callback);
    }
  }

  close() {
    if (this.socket) {
      this.socket.close(1000);
    }
  }
}

export default new WebSocketService();