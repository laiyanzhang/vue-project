<!-- 实现图片悬浮右侧展开预览大图弹窗功能，弹窗顶部与图片顶部平齐 -->
<template>
  <div class="image_view">
    <div class="image_list" ref="listRef">
      <div class="image_item" v-for="(item, index) in imgList" :key="index">
        <img :src="handleCom(item)" class="img" @mouseenter="e => handlePreview(e, item)" @mouseleave="preview.show = false"/>
      </div>
      <div class="module_view" v-show="preview.show" :style="previewStyle">
        <img :src="preview.url" class="img" />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, computed } from 'vue'
import { getImg } from '@/utils/imgExample'

export default defineComponent({
  setup() {
    const imgList = ref(getImg(0, 12))
    const listRef = ref(null)
    const preview = reactive({
      top: 0,
      bottom: 0,
      url: '',
      show: false
    })
    const previewStyle = computed(() => {
      // 弹窗实际高度
      const previewHeight = 538
      const container = listRef.value
      // 容器与视口顶部距离
      const containerTop = container ? container.getBoundingClientRect().top : 0
      const previewTop = preview.top
      const previewBottom = preview.bottom
      // 弹窗顶部与容器顶部的距离
      let top = previewTop - containerTop
      let bottom = previewBottom - previewHeight
      // 判断弹窗顶部与视口底部的距离是否能容纳整个弹窗
      if (bottom < 0) {
        // 无法容纳时，减小弹窗顶部距离容器顶部的距离从而抬升弹窗
        // 还需判断抬升后弹窗顶部与视口顶部是否仍大于0，否则设置为置顶距离，即负的容器与视口顶部距离
        top = previewTop + bottom > 0 ? top + bottom : 0 - containerTop
      }
      return {
        top: top + 'px'
      }
    })
    const handleCom = (url) => {
      return url + '?x-oss-process=image/resize,m_lfit,w_120'
    }
    // 获取当前图片顶部与视口顶部的距离top和底部的距离bottom
    const handlePreview = (e, url) => {
      const targetRect = e.target.getBoundingClientRect()
      preview.bottom = window.innerHeight - targetRect.top
      preview.top = targetRect.top
      preview.url = url + '?x-oss-process=image/resize,m_lfit,w_384'
      preview.show = true
    }
    return {
      listRef,
      imgList,
      preview,
      previewStyle,
      handleCom,
      handlePreview
    }
  }
})
</script>

<style lang="less" scoped>
.image_view {
  width: 100%;
  height: 100%;
  .image_list {
    position: relative;
    width: 404px;
    height: 100%;
    padding: 12px;
    border: 1px solid #ededed;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    .image_item {
      width: 120px;
      height: 120px;
      border-radius: 4px;
      overflow: hidden;
      .img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    .module_view {
      position: absolute;
      top: 0;
      right: -404px;
      width: 400px;
      height: 528px;
      background: #fff;
      box-shadow: 0 4px 10px 2px rgba(0, 0, 0, 0.16);
      padding: 8px;
      border-radius: 12px;
    }
  }
}
</style>
