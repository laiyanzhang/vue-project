import { createApp } from 'vue'
import component from './index.vue'

interface options {
  title?: string,
  content?: string,
  cancelText?: string,
  okText?: string,
  okFn?: () => void,
  cancelFn?: () => void
}

interface config {
  globalProperty?: boolean
  provideKey?: string
}

let instance:any = null

// 创建并返回对话框API
const createConfirmDialog = () => {
  if (!instance) {
    const mountPoint = document.createElement('div')
    document.body.appendChild(mountPoint)
    
    const app = createApp(component)
    instance = app.mount(mountPoint)
  }

  const excute = async (options: options) => {
    try {
      const resFn = await instance.open(options)
      if(resFn && typeof resFn == 'function') resFn()
    }
    catch(errFn) {
      if(errFn && typeof errFn == 'function') errFn()
    }
  }
  
  return {
    confirm: excute,
    
    // 可选：安装到应用实例
    install(app: any, config: config) {
      const { globalProperty = false, provideKey = 'confirm' } = config
      
      if (globalProperty) app.config.globalProperties.$confirm = excute  
      if (provideKey) app.provide(provideKey, excute)
    }
  }
}

// 导出默认的对话框API
const { confirm, install } = createConfirmDialog()

export {
  confirm,
  createConfirmDialog,
  install as default
}
