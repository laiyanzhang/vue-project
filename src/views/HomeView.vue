<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <h1>{{ $t('common.welcome') }}</h1>
    <div class="operation">
      <a-button @click="handleLocale('zh')">中文</a-button>
      <a-button @click="handleLocale('en')">English</a-button>
      <a-button @click="handleConfirm">确认弹窗</a-button>
    </div>
  </div>
</template>

<script>
import { defineComponent, inject  } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  setup() {
    const confirm = inject('confirm')
    const { locale } = useI18n()
    const handleLocale = (lang) => {
      locale.value = lang
      localStorage.setItem('locale', lang)
    }
    const handleConfirm = () => {
      confirm({
        title: '注意',
        content: '确认信息',
        okFn: () => {
          console.log('ok')
        },
        cancelFn: () => {
          console.log('cancel')
        }
      })
    }
    return {
      handleLocale,
      handleConfirm
    }
  }
})
</script>

<style scoped lang="less">
.home {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  .operation {
    display: flex;
    gap: 16px;
  }
}
</style>
