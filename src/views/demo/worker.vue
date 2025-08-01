<template>
  <div class="worker">
    <a-upload
      v-model:file-list="fileList"
      :customRequest="customUpload"
      name="file"
    >
      <a-button>
        <a-icon name="UploadOutlined"></a-icon>
        上传
      </a-button>
    </a-upload>
    <div class="operation">
      <a-button @click="handleChangeAlgorithm">切换算法：{{ algorithm == 'simple' ? '简单' : '复杂' }}</a-button>
      <a-button @click="handleDraw">主线程绘制图片</a-button>
      <a-button @click="handleMainFilter">主线程处理滤镜</a-button>
      <a-button @click="handleWorkerFilter">worker处理滤镜</a-button>
      <a-button @click="handleWorkerDraw">worker绘制图片</a-button>
      <a-button @click="handleWorkerDrawFilter">worker绘制滤镜</a-button>
    </div>
    <div class="canvas-container">
      <canvas id="canvas" ref="canvas"></canvas>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onUnmounted } from "vue";
import { simpleFilterCreate, difficultFilterCreate } from '@/utils/worker/filterWorker'
export default defineComponent({
  name: 'Worker',
  setup() {
    const canvas = ref(null);
    const fileList = ref([]);
    const maxWidth = ref('')
    const algorithm = ref('simple')

    const customUpload = ({ onSuccess }) =>{
      setTimeout(() => {
        onSuccess();
      }, 500);
    }

    const handleChangeAlgorithm = () => {
      algorithm.value = algorithm.value == 'simple' ? 'difficult' : 'simple'
    }

    // 主线程绘制图片
    const handleDraw = async () => {
      const file = fileList.value[0]?.originFileObj;
      const bitmap = await createImageBitmap(file)
      const container = document.querySelector('.canvas-container');
      const ctx = canvas.value.getContext("2d");
      // 设置canvas的宽高
      const clientWidth = container.clientWidth;
      const scaleFactor = clientWidth / bitmap.width;
      const scaledHeight = bitmap.height * scaleFactor;
      canvas.value.width = clientWidth;
      canvas.value.height = scaledHeight;
      maxWidth.value = clientWidth

      ctx.drawImage(bitmap, 0, 0, clientWidth, scaledHeight);
      bitmap.close()
    }

    // 主线程绘制滤镜
    const handleMainFilter = async () => {
      const ctx = canvas.value.getContext('2d')
      const imageData = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height);
      const data = imageData.data;
      if(algorithm.value == 'simple') simpleFilterCreate(data, 'sepia')
        else difficultFilterCreate(canvas.value, data, 'sepia')
      const processedBitmap = await createImageBitmap(imageData)
      ctx.drawImage(processedBitmap, 0, 0);
      processedBitmap.close()
      console.log('主线程滤镜处理完成');
    }

    // worker处理滤镜数据
    let workerFilter = null;
    const handleWorkerFilter = async () => {
      const file = fileList.value[0]?.originFileObj;
      const bitmap = await createImageBitmap(file)

      if(!workerFilter) {
        workerFilter = new Worker(new URL('../../utils/worker/filterWorker.js', import.meta.url));    
        // 统一处理消息
        workerFilter.onmessage = (e) => {
          if (e.data.type === 'result') {
            const bitmap = e.data.bitmap;
            const ctx = canvas.value.getContext('2d')
            ctx.drawImage(bitmap, 0, 0);
            bitmap.close()
            console.log('worker滤镜处理完成');
          }
        };
      }

      workerFilter.postMessage({
        type: 'process',
        bitmap: bitmap,
        filterType: 'sepia',
        maxWidth: maxWidth.value,
        algorithm: algorithm.value,
      }, [bitmap]);
    };

    const createWorkerDrawer = (message, transferArray) => {
      workerDrawer = new Worker(new URL('../../utils/worker/filterWorker.js', import.meta.url))
      const mainCanvas = canvas.value.transferControlToOffscreen()
      message.mainCanvas = mainCanvas
      transferArray.push(mainCanvas)
      // 统一处理消息
      workerDrawer.onmessage = (e) => {
        if (e.data.type === 'drawResult') {
          console.log('worker图片绘制完成')
        }
        if (e.data.type === 'drawFilterResult') {
          console.log('worker滤镜绘制完成')
        }
      };
    }

    let workerDrawer = null
    // worker绘制图片
    const handleWorkerDraw = async () => {
      const file = fileList.value[0]?.originFileObj;
      const bitmap = await createImageBitmap(file)
      const container = document.querySelector('.canvas-container');
      const clientWidth = container.clientWidth;
      const transferArray = [bitmap]
      let message = {
        type: 'draw',
        bitmap,
        clientWidth
      }

      if(!workerDrawer) createWorkerDrawer(message, transferArray)

      workerDrawer.postMessage(message, transferArray)
    }
    // worker绘制滤镜
    const handleWorkerDrawFilter = () => {
      let message = {
        type: 'drawFilter',
        filterType: 'sepia',
        algorithm: algorithm.value,
      }
      const transferArray = []

      if(!workerDrawer) createWorkerDrawer(message, transferArray)

      workerDrawer.postMessage(message, transferArray)
    }


    onUnmounted(() => {
      if(workerFilter) {
        workerFilter.terminate()
        workerFilter = null
      }
      if(workerDrawer) {
        workerDrawer.terminate()
        workerDrawer = null
      }
    })

    return {
      algorithm,
      fileList,
      canvas,
      customUpload,
      handleChangeAlgorithm,
      handleMainFilter,
      handleWorkerDrawFilter,
      handleWorkerFilter,
      handleDraw,
      handleWorkerDraw
    }
  },
})
</script>

<style lang="less" scoped>
.worker {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .operation {
    margin: 20px 0;
    display: flex;
    gap: 10px;
  }
  .canvas-container {
    width: 600px;
    border: 1px solid #ccc;
    #canvas {
      width: 100%;
      height: auto;
    }
  }
}
</style>