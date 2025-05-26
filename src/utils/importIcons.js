// src/utils/antd-icons.js
import * as Icons from '@ant-design/icons-vue'

// 列出你需要使用的所有图标名称
const iconList = [
  'SearchOutlined',
  'PlusOutlined',
  'EditOutlined',
  'DeleteOutlined',
  'DownloadOutlined',
  'UploadOutlined',
  'UserOutlined',
  'MenuOutlined',
  'HomeOutlined'
  // 添加更多你需要的图标
]

export default {
  install(app) {
    iconList.forEach(icon => {
      app.component(icon, Icons[icon])
    })
  }
}