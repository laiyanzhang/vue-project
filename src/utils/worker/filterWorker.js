let mainCanvas = null

onmessage = async (e) => {
  const data = e.data
  if (data.type === 'process') {
    const bitmap = await applyFilter(data.bitmap, data.filterType, data.maxWidth, data.algorithm);
    postMessage(
      { type: 'result', bitmap },
      [bitmap]
    );
  }
  if (data.type === 'drawFilter') {
    if(data.mainCanvas) mainCanvas = data.mainCanvas
    drawFilter(data.filterType, data.algorithm);
    postMessage(
      { type: 'drawFilterResult' },
    );
  }
  if (data.type === 'draw') {
    if(data.mainCanvas) mainCanvas = data.mainCanvas
    draw(data.bitmap, data.clientWidth)
    postMessage(
      { type: 'drawResult' },
    );
  }
};

// 绘制图片
const draw = (bitmap, clientWidth) => {
  const ctx = mainCanvas.getContext("2d")
  const scaleFactor = clientWidth / bitmap.width;
  const scaledHeight = bitmap.height * scaleFactor;
  mainCanvas.width = clientWidth;
  mainCanvas.height = scaledHeight;
  ctx.drawImage(bitmap, 0, 0, clientWidth, scaledHeight);
  bitmap.close()
}

// 绘制滤镜
const drawFilter = (filterType, algorithm) => {
  const ctx = mainCanvas.getContext("2d")
  const imageData = ctx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
  const data = imageData.data;
  if(algorithm == 'simple') simpleFilterCreate(data, filterType)
    else difficultFilterCreate(mainCanvas, data, filterType)
  ctx.putImageData(imageData, 0, 0)
}

// 处理滤镜
const applyFilter = async(bitmap, filterType, maxWidth, algorithm) => {
  const scaleFactor = maxWidth / bitmap.width;
  const scaledHeight = bitmap.height * scaleFactor;
  const offscreen = new OffscreenCanvas(maxWidth, scaledHeight)
  const ctx = offscreen.getContext("2d")
  ctx.drawImage(bitmap, 0, 0, maxWidth, scaledHeight);
  bitmap.close()
  const imageData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
  const data = imageData.data;
  if(algorithm == 'simple') simpleFilterCreate(data, filterType)
    else difficultFilterCreate(offscreen, data, filterType) 
  ctx.putImageData(imageData, 0, 0)
  return offscreen.transferToImageBitmap()
}

export const simpleFilterCreate = (data, filterType) => {
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
}

export const difficultFilterCreate = (canvas, data, filterType) => {
  const width = canvas.width;
  const height = canvas.height;
  // 创建临时缓冲区用于多阶段处理
  const tempBuffer = new Float32Array(width * height * 4);
  const edgeBuffer = new Float32Array(width * height);
  const luminanceBuffer = new Float32Array(width * height);
  
  // 辅助函数：带边界检查的像素获取
  function getPixel(x, y, offset) {
    x = Math.max(0, Math.min(width - 1, x));
    y = Math.max(0, Math.min(height - 1, y));
    return data[(y * width + x) * 4 + offset];
  }
  
  // 预计算亮度和边缘信息
  function precomputeBuffers() {
    // 计算亮度图
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        const r = getPixel(x, y, 0);
        const g = getPixel(x, y, 1);
        const b = getPixel(x, y, 2);
        luminanceBuffer[i] = 0.299 * r + 0.587 * g + 0.114 * b;
      }
    }
    
    // 计算边缘图（使用Sobel算子）
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        const i = y * width + x;
        
        // Sobel X
        gx += luminanceBuffer[i - width - 1] * -1;
        gx += luminanceBuffer[i - width] * 0;
        gx += luminanceBuffer[i - width + 1] * 1;
        gx += luminanceBuffer[i - 1] * -2;
        gx += luminanceBuffer[i] * 0;
        gx += luminanceBuffer[i + 1] * 2;
        gx += luminanceBuffer[i + width - 1] * -1;
        gx += luminanceBuffer[i + width] * 0;
        gx += luminanceBuffer[i + width + 1] * 1;
        
        // Sobel Y
        gy += luminanceBuffer[i - width - 1] * -1;
        gy += luminanceBuffer[i - width] * -2;
        gy += luminanceBuffer[i - width + 1] * -1;
        gy += luminanceBuffer[i - 1] * 0;
        gy += luminanceBuffer[i] * 0;
        gy += luminanceBuffer[i + 1] * 0;
        gy += luminanceBuffer[i + width - 1] * 1;
        gy += luminanceBuffer[i + width] * 2;
        gy += luminanceBuffer[i + width + 1] * 1;
        
        edgeBuffer[i] = Math.sqrt(gx * gx + gy * gy) / 5.66; // 归一化
      }
    }
  }
  
  // 分形噪声生成器
  function fractalNoise(x, y, octaves = 5, persistence = 0.5) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;
    
    for (let i = 0; i < octaves; i++) {
      total += perlinNoise(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }
    
    return total / maxValue;
  }
  
  // Perlin噪声简化实现
  function perlinNoise(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    
    const u = fade(x);
    const v = fade(y);
    
    const p = new Array(512);
    for (let i = 0; i < 256; i++) p[i] = p[i + 256] = permutation[i];
    
    const A = p[X] + Y, B = p[X + 1] + Y;
    
    return lerp(v, lerp(u, grad(p[A], x, y), grad(p[B], x - 1, y)),
                  lerp(u, grad(p[A + 1], x, y - 1), grad(p[B + 1], x - 1, y - 1)));
  }
  
  // 辅助函数
  function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(t, a, b) { return a + t * (b - a); }
  function grad(hash, x, y) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
  
  // 伪随机排列表
  const permutation = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,
    140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,
    247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,
    57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,
    74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,
    60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,
    65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,
    200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,
    52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,
    207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,
    119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,
    129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,
    218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,
    81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,
    184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,
    222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
  
  
  // 主处理逻辑
  switch(filterType) {
    case 'grayscale': {
      precomputeBuffers();
      
      // 高级灰度处理：带动态范围压缩和局部对比度增强
      let minLum = Infinity
      let maxLum = -Infinity
      for (let i = 0; i < luminanceBuffer.length; i++) {
        minLum = Math.min(minLum, luminanceBuffer[i]);
        maxLum = Math.max(maxLum, luminanceBuffer[i]);
      }
      const range = maxLum - minLum;
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const j = y * width + x;
          
          // 自适应灰度转换
          const lum = (luminanceBuffer[j] - minLum) / range;
          
          // 应用S曲线对比度增强
          const contrast = 2.5;
          const adjusted = Math.pow(Math.sin(lum * Math.PI / 2), contrast);
          
          // 添加微妙的边缘增强
          const edge = edgeBuffer[j] * 0.3;
          const final = Math.min(255, Math.max(0, (adjusted + edge) * 255));
          
          // 写入结果
          data[i] = data[i + 1] = data[i + 2] = final;
          
          // 在临时缓冲区存储处理后的值
          tempBuffer[i] = tempBuffer[i + 1] = tempBuffer[i + 2] = final / 255;
        }
      }
      break;
    }
      
    case 'sepia':
      precomputeBuffers();
      
      // 超级复古效果：带光照模型和表面纹理
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const j = y * width + x;
          
          // 原始颜色
          const r = data[i] / 255;
          const g = data[i + 1] / 255;
          const b = data[i + 2] / 255;
          
          // 基础复古色转换
          let newR = (r * 0.393 + g * 0.769 + b * 0.189);
          let newG = (r * 0.349 + g * 0.686 + b * 0.168);
          let newB = (r * 0.272 + g * 0.534 + b * 0.131);
          
          // 模拟光照效果（基于边缘方向）
          const edgeX = (edgeBuffer[j + 1] - edgeBuffer[j - 1]) * 2;
          const edgeY = (edgeBuffer[j + width] - edgeBuffer[j - width]) * 2;
          const light = Math.max(0, edgeX * 0.5 + edgeY * 0.5 + 0.5);
          
          // 添加表面纹理（使用分形噪声）
          const noise = fractalNoise(x / 20, y / 20) * 0.15;
          
          // 组合所有效果
          newR = newR * light + noise;
          newG = newG * light + noise;
          newB = newB * light + noise;
          
          // 添加边缘强调
          const edge = edgeBuffer[j] * 0.5;
          newR = Math.min(1, Math.max(0, newR + edge));
          newG = Math.min(1, Math.max(0, newG + edge));
          newB = Math.min(1, Math.max(0, newB + edge));
          
          // 转换为8位并写入
          data[i] = newR * 255;
          data[i + 1] = newG * 255;
          data[i + 2] = newB * 255;
        }
      }
      break;
      
    case 'invert':
      precomputeBuffers();
      
      // 高级反色：带色彩空间转换和动态范围调整
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const j = y * width + x;
          
          // 转换为HSL色彩空间
          let r = data[i] / 255;
          let g = data[i + 1] / 255;
          let b = data[i + 2] / 255;
          
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          let h, s, l = (max + min) / 2;
          
          if (max === min) {
            h = s = 0; // achromatic
          } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch(max) {
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
          }
          
          // 反色处理
          l = 1 - l;
          h = (h + 0.5) % 1;
          
          // 转换回RGB
          if (s === 0) {
            r = g = b = l;
          } else {
            const hue2rgb = (p, q, t) => {
              if (t < 0) t += 1;
              if (t > 1) t -= 1;
              if (t < 1/6) return p + (q - p) * 6 * t;
              if (t < 1/2) return q;
              if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
              return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
          }
          
          // 应用边缘增强
          const edge = edgeBuffer[j] * 0.7;
          r = Math.min(1, Math.max(0, r + edge));
          g = Math.min(1, Math.max(0, g + edge));
          b = Math.min(1, Math.max(0, b + edge));
          
          // 写入结果
          data[i] = r * 255;
          data[i + 1] = g * 255;
          data[i + 2] = b * 255;
        }
      }
      break;
      
    case 'thermal': {
      // 高级热成像效果：带温度梯度模拟
      precomputeBuffers();
      
      // 计算温度分布（基于亮度和边缘）
      const tempMap = new Float32Array(width * height);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const j = y * width + x;
          tempMap[j] = Math.pow(luminanceBuffer[j] / 255, 2.2) * (1 + edgeBuffer[j] * 0.3);
        }
      }
      
      // 应用热成像色阶
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const j = y * width + x;
          const temp = tempMap[j];
          
          // 复杂的热色谱
          if (temp < 0.2) {
            // 极冷区域
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 100 + temp * 500;
          } else if (temp < 0.4) {
            // 冷区域
            data[i] = 0;
            data[i + 1] = (temp - 0.2) * 1000;
            data[i + 2] = 200 - (temp - 0.2) * 500;
          } else if (temp < 0.6) {
            // 温区域
            data[i] = (temp - 0.4) * 1000;
            data[i + 1] = 200;
            data[i + 2] = 0;
          } else if (temp < 0.8) {
            // 热区域
            data[i] = 200 + (temp - 0.6) * 500;
            data[i + 1] = 200 - (temp - 0.6) * 500;
            data[i + 2] = 0;
          } else {
            // 极热区域
            data[i] = 255;
            data[i + 1] = 255 - (temp - 0.8) * 1000;
            data[i + 2] = 255 - (temp - 0.8) * 1000;
          }
          
          // 添加热辐射模糊效果
          if (x > 0 && y > 0 && x < width - 1 && y < height - 1) {
            const avg = (
              tempMap[j - 1] + tempMap[j + 1] + 
              tempMap[j - width] + tempMap[j + width]
            ) / 4;
            
            const blend = 0.3;
            data[i] = data[i] * (1 - blend) + (avg < 0.2 ? 0 : avg < 0.4 ? 0 : avg < 0.6 ? 200 : 255) * blend;
            data[i + 1] = data[i + 1] * (1 - blend) + (avg < 0.2 ? 0 : avg < 0.4 ? 200 : avg < 0.6 ? 200 : 255 - (avg - 0.8) * 1000) * blend;
            data[i + 2] = data[i + 2] * (1 - blend) + (avg < 0.2 ? 100 + avg * 500 : avg < 0.4 ? 200 - (avg - 0.2) * 500 : 0) * blend;
          }
        }
      }
      break;
    }
      
    case 'emboss': {
      // 高级浮雕效果：带深度图和光照
      precomputeBuffers();
      
      // 创建深度图（基于边缘和亮度）
      const depthMap = new Float32Array(width * height);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const j = y * width + x;
          depthMap[j] = luminanceBuffer[j] * (1 - edgeBuffer[j] * 0.5);
        }
      }
      
      // 应用浮雕效果
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const i = (y * width + x) * 4;
          const j = y * width + x;
          
          // 计算法线（基于深度梯度）
          const dzdx = (depthMap[j + 1] - depthMap[j - 1]) / 2;
          const dzdy = (depthMap[j + width] - depthMap[j - width]) / 2;
          
          // 光照方向
          const lx = 1, ly = 1, lz = 2;
          const len = Math.sqrt(lx * lx + ly * ly + lz * lz);
          
          // 计算反射强度
          const dot = (-dzdx * lx - dzdy * ly + lz) / len;
          const intensity = Math.max(0, Math.min(1, dot * 2 + 0.5));
          
          // 应用效果
          data[i] = data[i + 1] = data[i + 2] = intensity * 255;
        }
      }
      break;
    }
  }
}