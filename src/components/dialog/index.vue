<template>
  <div v-if="visible" class="confirm-dialog-overlay">
    <div class="confirm-dialog">
      <div class="confirm-dialog-body">
        <div class="confirm-dialog-title">{{ dialogTitle }}</div>
        <div class="confirm-dialog-content">{{ dialogContent }}</div>
      </div>
      <div class="confirm-dialog-footer">
        <div @click="handleCancel" class="button cancel">{{ dialogCancelText }}</div>
        <div @click="handleConfirm" class="button ok">{{ dialogOkText }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    const visible = ref(false)
    const dialogTitle = ref('')
    const dialogContent = ref('')
    const dialogCancelText = ref('取消')
    const dialogOkText = ref('确定')
    let dialogResolve = null
    let dialogReject = null
    let dialogOkFn = null
    let dialogCancelFn = null
    const open = (options) => {
      const {title, content, cancelText, okText, okFn, cancelFn} = options
      dialogTitle.value = title ? title : '提示'
      dialogContent.value = content ? content : '信息'
      dialogCancelText.value = cancelText ? cancelText : '取消'
      dialogOkText.value = okText ? okText : '确定'
      visible.value = true
      dialogOkFn = okFn
      dialogCancelFn = cancelFn
      return new Promise((resolve, reject) => {
        dialogResolve = resolve
        dialogReject = reject
      })
    }
    const handleConfirm = () => {
      visible.value = false
      if (dialogResolve) {
        dialogResolve(dialogOkFn)
      }
    }
    const handleCancel = () => {
      visible.value = false
      if (dialogReject) {
        dialogReject(dialogCancelFn)
      }
    }
    return {
      visible,
      dialogTitle,
      dialogContent,
      dialogCancelText,
      dialogOkText,
      open,
      handleCancel,
      handleConfirm
    }
  }
})
</script>

<style lang="less" scoped>
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.confirm-dialog {
  background-color: #fff;
  border-radius: 14px;
  min-width: 200px;
  max-width: 400px;
  .confirm-dialog-body {
    padding: 12px;
    .confirm-dialog-title {
      color: rgba(0, 0, 0, 0.88);
      font-size: 20px;
      margin-bottom: 4px;
      font-weight: 500;
      text-align: center;
    }
    .confirm-dialog-content {
      font-size: 16px;
      color: rgba(0, 0, 0, 0.65);
      text-align: center;
    }
  }
  .confirm-dialog-footer {
    width: 100%;
    height: 36px;
    display: flex;
    border-top: 1px solid rgba(60, 60, 67, 0.36);
    .button {
      flex: 1;
      width: 0;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      &:not(:last-child) {
        border-right: 1px solid rgba(60, 60, 67, 0.36);
      }
      &.cancel {
        color: rgba(0, 0, 0, 0.65);
      }
      &.ok {
        color: #4155f0;
      }
    }
  }
}
</style>
