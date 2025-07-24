<template>
  <div class="animation">
    <h2>{{ $t('common.1-guo-du-transition') }}</h2>
    <div class="transition">
      <div class="box"></div>
    </div>
    <h2>{{ $t('common.2-zhuan-huan-transform') }}</h2>
    <div class="transform">
      <div class="box rotate">rotate</div>
      <div class="box translate">translate</div>
      <div class="box scale">scale</div>
      <div class="box skew">skew</div>
    </div>
    <h3>{{ $t('common.21-ka-pian-fan-zhuan') }}</h3>
    <div class="flip-card">
      <div class="flip-card-inner">
        <div class="flip-card-front">
          <!-- 正面内容 -->
          <h2>{{ $t('common.zheng-mian') }}</h2>
        </div>
        <div class="flip-card-back">
          <!-- 背面内容 -->
          <h2>{{ $t('common.bei-mian') }}</h2>
        </div>
      </div>
    </div>
    <h3>{{ $t('common.22-li-fang-ti') }}</h3>
    <div class="operate">
      <a-button @click="handleReset">{{ $t('common.zhong-zhi-wei-zhi') }}</a-button>
      <a-button @click="handleAnimate">{{ animateText }}</a-button>
    </div>
    <div class="scene" ref="scene">
      <div class="cube" ref="cube">
        <div class="cube__face cube__face--front">{{ $t('common.qian') }}</div>
        <div class="cube__face cube__face--back">{{ $t('common.hou') }}</div>
        <div class="cube__face cube__face--right">{{ $t('common.you') }}</div>
        <div class="cube__face cube__face--left">{{ $t('common.zuo') }}</div>
        <div class="cube__face cube__face--top">{{ $t('common.shang') }}</div>
        <div class="cube__face cube__face--bottom">{{ $t('common.xia') }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, ref, reactive, onBeforeUnmount, onMounted } from 'vue'
import { useI18n } from 'vue-i18n' 

export default defineComponent({
  setup() {
    const {t} = useI18n()
    const cube = ref(null)
    const scene = ref(null)
    const isDragging = ref(false)
    const previousMousePosition = reactive({
      x: 0,
      y: 0
    })
    const rotate = reactive({
      x: 15,
      y: 30
    })
    const autoRotate = ref(false)
    const animationId = ref(null)
    const animateText = computed(() => autoRotate.value ? t('common.ting-zhi-dong-hua') : t('common.kai-shi-dong-hua'))

    const updateCubePosition = () => {
      cube.value.style.transform = `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`;
    }
    // 鼠标点击时记录位置以及停止东湖
    const handleMouseDown = (e) => {
      isDragging.value = true
      previousMousePosition.x = e.clientX
      previousMousePosition.y = e.clientY
      stopAutoRotation()
    }
    // 鼠标移动时根据移动位置计算移动后位置
    const handleMouseMove = (e) => {
      if(!isDragging.value) return
      const deltaX = e.clientX - previousMousePosition.x
      const deltaY = e.clientY - previousMousePosition.y
      rotate.y += deltaX * 0.5
      rotate.x -= deltaY * 0.5
      updateCubePosition()
      previousMousePosition.x = e.clientX
      previousMousePosition.y = e.clientY
    }
    // 鼠标点击结束后重新执行动画
    const handleMouseUp = () => {
      isDragging.value = false
      startAutoRotationIfEnabled()
    }
    // 键盘键入时计算位置变化
    const handleKeyDown = (e) => {
      const rotationStep = 5          
      switch (e.key) {
        case 'ArrowUp':
          rotate.x -= rotationStep
          break
        case 'ArrowDown':
          rotate.x += rotationStep
          break
        case 'ArrowLeft':
          rotate.y -= rotationStep
          break
        case 'ArrowRight':
          rotate.y += rotationStep
          break
      }

      updateCubePosition()
      stopAutoRotation()
    }
    // 键盘键入结束后重新执行动画
    const handleKeyUp = () => {
      startAutoRotationIfEnabled()
    }
    const startAutoRotationIfEnabled = () => {
      if(autoRotate.value) {
        startAutoRotation()
      }
    }
    const startAutoRotation = () => {
      stopAutoRotation()
      function animate() {
        rotate.y += 0.5
        updateCubePosition()
        animationId.value = requestAnimationFrame(animate)
      }
      animate()
    }
    const stopAutoRotation = () => {
      if (animationId.value) {
        cancelAnimationFrame(animationId.value);
        animationId.value = null;
      }
    }
    const handleAnimate = () => {
      autoRotate.value = !autoRotate.value
      if(autoRotate.value) startAutoRotation()
      else stopAutoRotation()
    }
    const handleReset = () => {
      rotate.x = 15
      rotate.y = 30
      updateCubePosition()
      stopAutoRotation()
    }

    // 初始化立方体位置
    onMounted(() => {
      updateCubePosition()
      scene.value.addEventListener('mousedown', handleMouseDown)
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('keyup', handleKeyUp)
    })

    onBeforeUnmount(() => {
      scene.value.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    })


    return {
      animateText,
      cube,
      scene,
      handleAnimate,
      handleReset
    }
  }
})
</script>

<style lang="less" scoped>
.animation {
  width: 100%;
  height: 1000px;
  text-align: left;
  .transition {
    .box {
      width: 50px;
      height: 50px;
      background-color: pink;
      transition-property: all;
      transition-duration: 0.8s;
      transition-timing-function: cubic-bezier(0.49, 1.59, 0.46, -0.21);
      transition-delay: 1s;
    }
    .box:hover {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background-color: skyblue;
      transform: rotate(360deg);
      transition-delay: 0s;
    }
  }
  .transform {
    display: flex;
    gap: 60px;
    .box {
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color:aqua;
    }
    .rotate {
      transform: rotateX(45deg);
    }
    .translate {
      transform: translateX(10%);
    }
    .scale {
      transform: scale(1.5);
    }
    .skew {
      transform: skewY(30deg);
    }
  }
  .flip-card {
    perspective: 1000px; /* 设置3D透视效果 */
    width: 300px;
    height: 200px;
    transform-style: preserve-3d;
    &:hover .flip-card-inner {
      transform: rotateY(180deg); /* 鼠标悬停时翻转180度 */
    }
    .flip-card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 1s;
      transform-style: preserve-3d; /* 保持3D变换 */
    }
    .flip-card-front, .flip-card-back {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden; /* 隐藏背面 */
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .flip-card-front {
      background-color: #4CAF50;
      color: white;
    }

    .flip-card-back {
      background-color: #f44336;
      color: white;
      transform: rotateY(180deg); /* 初始状态背面是翻转的 */
    }
  }
  .scene {
    width: 200px;
    height: 300px;
    perspective: 1000px;
    margin: 100px auto;
    .cube {
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      .cube__face {
        position: absolute;
        width: 200px;
        height: 200px;
        border: 2px solid #333;
        opacity: 0.8;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: white;
        font-weight: bold;
      }
      /* 各个面的位置和旋转 */
      .cube__face--front {
        background: rgba(255, 0, 0, 0.7);
        transform: rotateY(0deg) translateZ(100px);
      }

      .cube__face--back {
        background: rgba(0, 255, 0, 0.7);
        transform: rotateY(180deg) translateZ(100px);
      }

      .cube__face--right {
        background: rgba(0, 0, 255, 0.7);
        transform: rotateY(90deg) translateZ(100px);
      }

      .cube__face--left {
        background: rgba(255, 255, 0, 0.7);
        transform: rotateY(-90deg) translateZ(100px);
      }

      .cube__face--top {
        background: rgba(255, 0, 255, 0.7);
        transform: rotateX(90deg) translateZ(100px);
      }

      .cube__face--bottom {
        background: rgba(0, 255, 255, 0.7);
        transform: rotateX(-90deg) translateZ(100px);
      }
    }
  }
  .operate {
    display: flex;
    gap: 8px;
  }
}
</style>
