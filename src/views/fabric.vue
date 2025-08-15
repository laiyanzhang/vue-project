<template>
  <div class="fabric">
    <div class="operation">
      <a-button @click="handleAddRect">增加一个矩形</a-button>
      <a-button @click="handleChangeRect">调整矩形位置</a-button>
      <a-button @click="handleAddEditText">增加一个可编辑文本框</a-button>
      <a-button @click="handleAddImg">增加一张图片</a-button>
      <a-button @click="handleAddAnimate">矩形动画</a-button>
      <a-button @click="handleAddImgFilter">给图片加上滤镜</a-button>
      <a-button @click="handleAddGradientCircle">给圆形添加渐变色</a-button>
      <a-button @click="handleAddText">增加一个文本</a-button>
      <a-button @click="handleAddGroup">增加一个组</a-button>
      <a-button @click="handleUpdateGroup">更新组</a-button>
      <a-button @click="handleClear">清空画布</a-button>
      <a-button @click="handleSerialize">序列化矩形与图片</a-button>
      <a-button @click="handleNewSubclass">新建子类</a-button>
    </div>
    <div class="canvas_container">
      <canvas id="canvas" ref="canvasId"></canvas>
    </div>
  </div>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue';
import { fabric } from 'fabric';
import image from '@/assets/page3.jpeg'
export default defineComponent({
  setup() {
    let canvas = null
    let rect = null
    let img = null
    let group = null
    const canvasId = ref(null)
    // 给所有使用到的图形类型添加自定义控制点样式
    const setOwnDefaults = () => {      
      fabric.Object.prototype.cornerColor = '#fff'
      fabric.Object.prototype.transparentCorners = false
      fabric.Object.prototype.cornerStrokeColor = '#ccc'
      fabric.Object.prototype.cornerSize = 8
      fabric.Object.prototype.padding = 5
      fabric.Object.prototype.cornerStyle = 'circle'
      const mtrControl = fabric.Object.prototype.controls.mtr;
      mtrControl.offsetY = -10
    }
    setOwnDefaults()
    onMounted(() => {
      canvas = new fabric.Canvas(canvasId.value, {
        width: 600,
        height: 400,
      });
    });
    // 新增一个矩形
    const handleAddRect = () => {
      rect = new fabric.Rect({
        left: 200,
        top: 100,
        fill: 'red',
        width: 30,
        height: 30,
        rotatingPointOffset: 1,

      })
      canvas.add(rect)
    }
    // 新增可编辑文本
    const handleAddEditText = () => {
      const shadow = new fabric.Shadow({
        color: 'rgb(255, 0, 255)',
        blur: 8,
        offsetX: 0,
        offsetY: 0
      })
      const text = new fabric.Textbox('双击修改文字', {
        left: 100,
        top: 100,
        width: 200,  // 必须设置宽度才能自动换行
        fontSize: 20,
        borderColor: '#0099ff',
        editingBorderColor: '#ff0000', // 编辑状态边框色
        fill: '#333',
        shadow
      });
      canvas.add(text)
    }
    // 改变初始矩形位置
    const handleChangeRect = () => {
      rect.set({ left: 20, top: 50 })
      canvas.renderAll()
    }
    // 绘制一张图片
    const handleAddImg = async () => {
      try {
        fabric.Image.fromURL(image, (result) => {
          img = result
          const scale = Math.min(
            canvas.width / img.width,
            canvas.height / img.height
          );
          
          img.set({
            scaleX: scale,
            scaleY: scale,
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: 'center',
            originY: 'center'
          });
          canvas.add(img)
        })
      } catch (error) {
        console.log(error)
      }
    }
    // 给初始矩形设置动画效果
    const handleAddAnimate = () => {
      rect.animate('angle', '-=5', { onChange: canvas.renderAll.bind(canvas) });
      fabric.util.animate({
        startValue: 0,
        endValue: 45,
        duration: 2000,
        onChange: (v) => {
          rect.set('angle', v)
          canvas.renderAll()
        }
      })
    }
    // 对图片进行滤镜处理
    const handleAddImgFilter = () => {
      img.filters.push(new fabric.Image.filters.Grayscale())
      img.applyFilters()
      canvas.renderAll()
    }
    // 新增一个渐变色的圆形
    const handleAddGradientCircle = () => {
      const circle = new fabric.Circle({
        left: 10,
        top: 10,
        radius: 10,
      })
      const gradient = new fabric.Gradient({
        type: 'linear',
        gradientUnits: 'pixels', // or 'percentage'
        coords: { x1: 0, y1: 0, x2: 0, y2: 20 },
        colorStops:[
          { offset: 0, color: '#000' },
          { offset: 1, color: '#fff'}
        ]
      })
      circle.set('fill', gradient)
      canvas.add(circle)
    }
    // 新增一个文本
    const handleAddText = () => {
      const text = new fabric.Text('Hello World', {
        left: 100,
        top: 100,
        fontSize: 20,
        fill: '#333',
        fontFamily: 'Comic Sans'
      });
      canvas.add(text)
    }
    // 新增一个组
    const handleAddGroup = () => { 
      const circle = new fabric.Circle({
        radius: 100,
        fill: '#eef',
        scaleY: 0.5,
        originX: 'center',
        originY: 'center'
      });

      // 创建一个文本对象
      const text = new fabric.Text('hello world', {
        fontSize: 30,
        originX: 'center',
        originY: 'center'
      });

      // 创建一个包含圆形和文本的组合对象
      group = new fabric.Group([circle, text], {
        left: 150,
        top: 100,
        angle: -10
      });
      canvas.add(group);
    }
    // 更新组内容
    const handleUpdateGroup = () => { 
      group.addWithUpdate(new fabric.Rect({
        width: 30,
        height: 30,
        left: group.get('left'),
        top: group.get('top'),
        originX: 'center',
        originY: 'center'
      }));
      canvas.renderAll();
    }
    // 清空画布
    const handleClear = () => { 
      canvas.clear();
    }
    // 序列化矩形与图片
    const handleSerialize = () => { 
      rect.name = 'test'
      /* img.name = 'test2' */
      rect.toObject = (function(toObject) {
        return function() {
          return fabric.util.object.extend(toObject.call(this), {
            name: this.name
          });
        };
      })(rect.toObject)
      const object = canvas.toObject();
      const json = JSON.stringify(object);
      console.log('object', object);
      console.log('json', json)
      console.log('svg', canvas.toSVG())
    }
    // 新建子类
    const handleNewSubclass = () => { 
      const LabeledRect = fabric.util.createClass(fabric.Rect, {
        type: 'labelRect',
        initialize: function(options) {
          options || (options = { });

          this.callSuper('initialize', options);
          this.set('label', options.label || '');
        },
        toObject: function() {
          return fabric.util.object.extend(this.callSuper('toObject'), {
            label: this.get('label')
          });
        },
        _render: function(ctx) {
          this.callSuper('_render', ctx);

          ctx.font = '20px Helvetica';
          ctx.fillStyle = '#333';
          ctx.fillText(this.label, -this.width/2, -this.height/2 + 20);
        }
      })
      const labeledRect = new LabeledRect({
        width: 100,
        height: 50,
        left: 100,
        top: 100,
        label: 'test',
        fill: '#faa'
      });
      canvas.add(labeledRect)
    }
    return {
      canvasId,
      handleChangeRect,
      handleAddRect,
      handleAddEditText,
      handleAddImg,
      handleAddAnimate,
      handleAddImgFilter,
      handleAddGradientCircle,
      handleAddText,
      handleAddGroup,
      handleUpdateGroup,
      handleClear,
      handleSerialize,
      handleNewSubclass,
    };
  },
})
</script>

<style lang="less" scoped>
.fabric {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  .operation {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .canvas_container {
    width: 600px;
    height: 400px;
    border: 1px solid #ccc;
  }
}
</style>