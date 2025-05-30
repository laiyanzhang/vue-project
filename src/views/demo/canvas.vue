<template>
  <div class="canvas">
    <a-upload
      v-model:file-list="fileList"
      name="file"
      :customRequest="customUpload"
      @change="handleChange"
    >
      <a-button>
        <a-icon name="UploadOutlined"></a-icon>
        上传
      </a-button>
    </a-upload>
    <video ref="videoPlayer" :src="videoUrl" controls v-if="videoUrl"></video>
    <video ref="hidePlayer" style="display: none;"></video>
    <div class="operation">
      <a-button @click="handleCreateFilter">生成滤镜</a-button>
      <a-button @click="handleCompress">压缩图片</a-button>
      <a-button @click="handleVideoFrame">获取视频帧</a-button>
      <a-button @click="handleComplexScene">复杂场景</a-button>
    </div>
    <div class="canvas-container">
      <canvas id="canvas" ref="canvas"></canvas>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import { compressImage, applyFilter, drawComplexScene, extractFrameFromLocalFile } from '@/utils/canvas.js';
import { downloadFile } from '@/utils/download.js';
export default defineComponent({
  name: "CanvasDemo",
  setup() {
    const canvas = ref(null);
    const fileList = ref([]);
    const videoPlayer = ref(null);
    const hidePlayer = ref(null);
    const videoUrl = ref(null);

    const customUpload = ({ file, onSuccess }) =>{
      if(file.type.includes('video/')) {
        if(videoUrl.value) {
          URL.revokeObjectURL(videoUrl.value);
        }
        const url = URL.createObjectURL(file);
        videoUrl.value = url;
      }
      setTimeout(() => {
        onSuccess();
      }, 1000);
    }

    const handleChange = (info) => {
      if (info.fileList.length == 0) {
        videoUrl.value = null;
      }
    };

    const handleCreateFilter = () => {
      const file = fileList.value[0]?.originFileObj;
      if(!file || file.type.includes('video/')) return;

      const reader = new FileReader();
      reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
          const container = document.querySelector('.canvas-container');
          const ctx = canvas.value.getContext("2d");
          // 设置canvas的宽高
          const maxWidth = container.clientWidth;
          const scaleFactor = maxWidth / img.width;
          const scaledHeight = img.height * scaleFactor;
          canvas.value.width = maxWidth;
          canvas.value.height = scaledHeight;
          ctx.drawImage(img, 0, 0, maxWidth, scaledHeight);
          applyFilter(canvas.value, 'sepia');
        };
        img.src = event.target.result; // Data URL
      };
      reader.readAsDataURL(file);
    };

    const handleCompress = async () => {
      const file = fileList.value[0]?.originFileObj;
      if(!file || file.type.includes('video/')) return;
      const compressBlob = await compressImage(file)
      downloadFile(compressBlob, file.name);
    };

    const handleVideoFrame = () => {
      const file = fileList.value[0]?.originFileObj;
      if(!file || !file.type.includes('video/')) return;
      const hideVideo = hidePlayer.value;
      extractFrameFromLocalFile(hideVideo, file, 1, canvas.value);
    };

    const handleComplexScene = () => {
      const ctx = canvas.value.getContext("2d");
      const width = 800
      const height = 600
      ctx.fillStyle = '#000000';
      canvas.value.width = width;
      canvas.value.height = height;
      ctx.fillRect(0, 0, width, height);
      
      // 绘制离屏Canvas内容
      const complexScene = drawComplexScene(width, height);
      ctx.drawImage(complexScene, 0, 0);
      // 自动匹配显示器刷新率形成动画效果
      // requestAnimationFrame(handleComplexScene)
    };

    return {
      fileList,
      canvas,
      videoPlayer,
      videoUrl,
      hidePlayer,
      handleCreateFilter,
      handleCompress,
      customUpload,
      handleChange,
      handleVideoFrame,
      handleComplexScene,
    };
  },
});
</script>

<style scoped lang="less">
.canvas {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .svg-container {
    width: 100px;
    height: 100px;
    margin-bottom: 20px;
    svg {
      width: 100%;
      height: 100%;
    }
  }
  .operation {
    margin: 20px 0;
    display: flex;
    gap: 10px;
  }
  .canvas-container {
    width: 600px;
    #canvas {
      width: 100%;
      height: auto;
    }
  }
}
</style>