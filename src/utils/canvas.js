/**
 * 压缩图片至指定大小以下（优先使用Blob API）
 * @param {File} file - 原始图片文件
 * @param {number} maxSize - 目标最大字节数（默认2MB）
 * @returns {Promise<File>} - 返回压缩后的新文件
 */
export function compressImage(file, maxSize = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file); // 读取为DataURL（兼容性）
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 使用Blob API压缩（异步）
        compressCanvasToBlob(canvas, maxSize)
          .then(blob => {
            resolve(blob);
          })
          .catch(reject);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

/**
 * 通过逐步降低质量压缩Canvas，直到满足大小要求
 * @param {HTMLCanvasElement} canvas - 目标Canvas
 * @param {number} maxSize - 最大允许字节数
 * @returns {Promise<Blob>} - 返回压缩后的Blob
 */
function compressCanvasToBlob(canvas, maxSize) {
  return new Promise((resolve, reject) => {
    let quality = 1.0; // 初始质量

    const tryCompress = () => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to generate blob'));
            return;
          }

          if (blob.size <= maxSize || quality <= 0.1) {
            resolve(blob); // 满足条件或质量已降至最低
          } else {
            quality -= 0.1; // 降低质量继续尝试
            setTimeout(tryCompress, 0); // 避免阻塞主线程
          }
        },
        'image/jpeg',
        quality
      );
    };

    tryCompress();
  });
}

// 常见滤镜实现
export function applyFilter(canvas, filterType) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  switch(filterType) {
    case 'grayscale':
      // 灰度滤镜
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;     // R
        data[i + 1] = avg; // G
        data[i + 2] = avg; // B
      }
      break;
      
    case 'sepia':
      // 复古滤镜
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
        data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
        data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
      }
      break;
      
    case 'invert':
      // 反色滤镜
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];     // R
        data[i + 1] = 255 - data[i + 1]; // G
        data[i + 2] = 255 - data[i + 2]; // B
      }
      break;
  }
  
  ctx.putImageData(imageData, 0, 0);
}

/**
 * 从本地视频文件提取指定时间帧
 * @param {HTMLVideoElement} hiddenVideo - 隐藏的视频元素
 * @param {File} videoFile - 用户上传的视频文件对象
 * @param {number} targetTime - 要提取的时间点(秒)
 * @param {HTMLCanvasElement} canvas - 用于绘制帧的Canvas元素
 * @returns {Promise<string>} - 返回帧的DataURL
 */
export async function extractFrameFromLocalFile(hiddenVideo, videoFile, targetTime, canvas) {
  return new Promise((resolve, reject) => {
    // 清理之前的资源
    if (hiddenVideo.src) {
      URL.revokeObjectURL(hiddenVideo.src);
      hiddenVideo.src = '';
    }
    
    // 移除之前的事件监听器
    hiddenVideo.oncanplay = null;
    const cleanupSeeked = () => {
      hiddenVideo.removeEventListener('seeked', onSeeked);
    };
    
    const onSeeked = function() {
      try {
        // 设置Canvas尺寸
        canvas.width = hiddenVideo.videoWidth;
        canvas.height = hiddenVideo.videoHeight;
        
        // 绘制当前帧
        const ctx = canvas.getContext('2d');
        ctx.drawImage(hiddenVideo, 0, 0, canvas.width, canvas.height);
        
        // 清理资源
        cleanupSeeked();
        URL.revokeObjectURL(hiddenVideo.src);
        hiddenVideo.src = '';
        
        // 返回图像数据
        resolve(canvas.toDataURL('image/jpeg'));
      } catch (error) {
        cleanupSeeked();
        reject(error);
      }
    };
    
    hiddenVideo.addEventListener('seeked', onSeeked, { once: true });
    
    hiddenVideo.oncanplay = () => {
      try {
        hiddenVideo.currentTime = targetTime;
      } catch (error) {
        cleanupSeeked();
        reject(error);
      }
    };
    
    hiddenVideo.onerror = () => {
      cleanupSeeked();
      reject(new Error('视频加载失败'));
    };
    
    // 设置超时处理
    const timeout = setTimeout(() => {
      cleanupSeeked();
      reject(new Error('操作超时'));
    }, 10000); // 10秒超时
    
    // 开始加载视频
    hiddenVideo.src = URL.createObjectURL(videoFile);
    
    // 清理超时
    Promise.resolve().then(() => clearTimeout(timeout));
  });
}

// 离屏Canvas进行复杂绘图
export function drawComplexScene(width, height) {
  // 创建离屏Canvas
  const offscreenCanvas = document.createElement('canvas');
  const offscreenCtx = offscreenCanvas.getContext('2d');
  offscreenCanvas.width = width;
  offscreenCanvas.height = height;
  // 清空画布
  offscreenCtx.clearRect(0, 0, width, height);
  
  // 绘制复杂图形
  for (let i = 0; i < 100; i++) {
    offscreenCtx.beginPath();
    offscreenCtx.fillStyle = `hsl(${Math.random() * 360}, 70%, 60%)`;
    offscreenCtx.arc(
      Math.random() * width,
      Math.random() * height,
      Math.random() * 30 + 10,
      0,
      Math.PI * 2
    );
    offscreenCtx.fill();
  }
  
  // 添加文字
  offscreenCtx.font = '40px Arial';
  offscreenCtx.fillStyle = 'white';
  offscreenCtx.textAlign = 'center';
  offscreenCtx.fillText('Complex Drawing', width / 2, 50);
  return offscreenCanvas;
}