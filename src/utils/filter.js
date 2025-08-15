import { filters } from 'fabric';

class Redify extends filters.BaseFilter {
  /**
   * 滤镜类型标识（必须与类名一致）
   * 使用 getter 方式定义
   */
  get type() {
    return 'Redify';
  }

  /**
   * Fragment shader 源码
   * 必须定义为实例属性（非静态属性）
   */
  fragmentSource = `
    precision highp float;
    uniform sampler2D uTexture;
    uniform float uMyParameter; // 自定义参数
    varying vec2 vTexCoord;
    void main() {
      vec4 color = texture2D(uTexture, vTexCoord);
      // 你的WebGL处理逻辑（示例：增强红色通道）
      color.r *= (1.0 + uMyParameter);
      gl_FragColor = color;
    }
  `;

  // ► 1.3 定义CPU回退处理
  applyTo2d({ imageData }) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      // 你的CPU处理逻辑（必须与WebGL逻辑一致）
      data[i] = Math.min(255, data[i] * (1 + this.myParameter)); // R通道
    }
  }
}

// 正确的静态方法绑定方式
Object.assign(Redify, {
  fromObject: filters.BaseFilter.fromObject
});

export default Redify;
