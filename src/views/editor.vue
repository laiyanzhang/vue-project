<template>
  <div class="canvas-container">
    <div class="controls">
      <a-input v-model:value="textInput" placeholder="输入文本" />
      <a-button @click="addText">添加文本</a-button>
    </div>
    <canvas
      ref="canvas"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      :style="{'cursor': cursor}">
    </canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'

const canvas = ref(null)
const ctx = ref(null)
const textInput = ref('示例文本')
const texts = ref([])
const selectedTextIndex = ref(-1)
const isDragging = ref(false)
const isResizing = ref(false)
const resizeHandleIndex = ref(-1)
const cursor = ref('default')
const offsetPosition = reactive({
  x: 0,
  y: 0
})

// 控制点大小
const handleSize = 8

// 文本对象结构
const createTextObject = (text, x, y) => {
  let fontSize = 24
  let width = text.length * (fontSize + 4)
  return {
    text,
    x,
    y,
    width, // 初始宽度
    height: fontSize + 8, // 初始高度
    fontSize,
    color: '#000000'
  }
}

// 初始化画布
onMounted(() => {
  const canvasEl = canvas.value
  canvasEl.width = 800
  canvasEl.height = 500
  ctx.value = canvasEl.getContext('2d')
  
  // 添加一个初始文本
  texts.value.push(createTextObject('示例文本', 100, 100))
  drawCanvas()
})

// 绘制画布
const drawCanvas = () => {
  const canvasEl = canvas.value
  ctx.value.clearRect(0, 0, canvasEl.width, canvasEl.height)
  
  texts.value.forEach((textObj, index) => {
    // 绘制文本
    ctx.value.font = `${textObj.fontSize}px Arial`
    ctx.value.fillStyle = textObj.color
    ctx.value.fillText(textObj.text, textObj.x + 2, textObj.y + textObj.height - 8)
    
    // 绘制包围框
    ctx.value.strokeStyle = index === selectedTextIndex.value ? '#3498db' : '#999999'
    ctx.value.lineWidth = 1
    ctx.value.strokeRect(
      textObj.x,
      textObj.y,
      textObj.width,
      textObj.height
    )
    
    // 如果选中，绘制控制点
    if (index === selectedTextIndex.value) {
      const handles = getResizeHandles(textObj)
      handles.forEach((handle) => {
        ctx.value.fillStyle = '#3498db'
        ctx.value.fillRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize)
      })
    }
  })
}

// 获取文本对象的控制点位置
const getResizeHandles = (textObj) => {
  const left = textObj.x
  const top = textObj.y
  const right = left + textObj.width
  const bottom = top + textObj.height
  
  return [
    { x: left, y: top, cursor: 'nwse-resize' },    // 左上
    { x: left, y: top + textObj.height / 2, cursor: 'ew-resize'  }, // 左中
    { x: left, y: bottom, cursor: 'nesw-resize' },   // 左下
    { x: right, y: top, cursor: 'nesw-resize' },   // 右上
    { x: right, y: top + textObj.height / 2, cursor: 'ew-resize' },   // 右中
    { x: right, y: bottom, cursor: 'nwse-resize' }, // 右下
  ]
}

// 检测点击位置是否在控制点上
const getHandleAtPosition = (x, y, textObj) => {
  const handles = getResizeHandles(textObj)
  for (let i = 0; i < handles.length; i++) {
    const handle = handles[i]
    if (
      x >= handle.x - handleSize &&
      x <= handle.x + handleSize &&
      y >= handle.y - handleSize &&
      y <= handle.y + handleSize
    ) {
      return i
    }
  }
  return -1
}

// 检测点击位置是否在文本框内
const getHandleAtText = (x, y) => {
  for (let i = texts.value.length - 1; i >= 0; i--) {
      const textObj = texts.value[i]
      const left = textObj.x
      const top = textObj.y
      const right = left + textObj.width
      const bottom = top + textObj.height
      
      if (x >= left && x <= right && y >= top && y <= bottom) {
        return i
      }
    }
    return -1
}

// 检测点击位置是否在文本上
const handleTextSelection = (x, y) => {
  if (selectedTextIndex.value !== -1) {
    const textObj = texts.value[selectedTextIndex.value]
    if (getHandleAtPosition(x, y, textObj) !== -1) {
      return selectedTextIndex.value
    }
    else {
      return getHandleAtText(x, y)
    }
  }
  else {
    return getHandleAtText(x, y)
  }
}

// 鼠标按下事件
const handleMouseDown = (e) => {
  const rect = canvas.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  
  selectedTextIndex.value = handleTextSelection(x, y)
  
  if (selectedTextIndex.value !== -1) {
    const textObj = texts.value[selectedTextIndex.value]
    offsetPosition.x = x - textObj.x
    offsetPosition.y = y - textObj.y
    resizeHandleIndex.value = getHandleAtPosition(x, y, textObj)
    
    if (resizeHandleIndex.value !== -1) {
      isResizing.value = true
    } else {
      isDragging.value = true
    }
  }
  
  drawCanvas()
}

// 判断鼠标是否悬浮在点位上，切换鼠标样式
const checkHandleHover = (x, y) => {
  if (selectedTextIndex.value !== -1) {
    const textObj = texts.value[selectedTextIndex.value]
    const index = getHandleAtPosition(x, y, textObj)
    if(index !== -1) {
      cursor.value = getResizeHandles(textObj)[index].cursor
    }
    else {
      cursor.value = 'default'
    }
  }
  else {
    cursor.value = 'default'
  }
}

// 鼠标移动事件
const handleMouseMove = (e) => {
  const rect = canvas.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  checkHandleHover(x,y)
  
  if (!isDragging.value && !isResizing.value) return
  
  if (selectedTextIndex.value !== -1) {
    const textObj = texts.value[selectedTextIndex.value]
    const left = textObj.x
    const top = textObj.y
    
    if (isResizing.value) {    
      switch (resizeHandleIndex.value) {
        case 0: // 左上
          textObj.width += left - x
          textObj.height += top - y
          textObj.x = x
          textObj.y = y
          break
        case 1: // 左中
          textObj.width += left - x
          textObj.x = x
          break
        case 2: // 左下
          textObj.width += left - x
          textObj.height = y - top
          textObj.x = x
          break
        case 3: // 右上
          textObj.width = x - left
          textObj.height += top - y
          textObj.y = y
          break
        case 4: // 右中
          textObj.width = x - left
          break
        case 5: // 右下
          textObj.width = x - left
          textObj.height = y - top
          break         
      }
      
      // 限制最小尺寸
      textObj.width = Math.max(30, textObj.width)
      textObj.height = Math.max(20, textObj.height)
      
      // 根据宽度调整字体大小
      if(resizeHandleIndex.value !== 1 && resizeHandleIndex.value !== 4) {
        textObj.fontSize = Math.max(12, Math.min(72, textObj.width / 5))
      }
    } 
    else if (isDragging.value) {
      // 移动文本
      textObj.x = x - offsetPosition.x
      textObj.y = y - offsetPosition.y
    }
    
    drawCanvas()
  }
}

// 鼠标释放事件
const handleMouseUp = () => {
  isDragging.value = false
  isResizing.value = false
  resizeHandleIndex.value = -1
}

// 添加新文本
const addText = () => {
  if (textInput.value.trim()) {
    texts.value.push(createTextObject(textInput.value, 50, 50))
    selectedTextIndex.value = texts.value.length - 1
    textInput.value = ''
    drawCanvas()
  }
}
</script>

<style lang="less" scoped>
.canvas-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}
canvas {
  border: 1px solid #ccc;
  background-color: white;
}

.controls {
  display: flex;
  width: 400px;
  gap: 10px;
  margin: 0 auto;
}
</style>