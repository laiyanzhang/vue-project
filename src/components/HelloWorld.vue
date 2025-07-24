<template>
  <div class="hello">
    <h1>{{ $t('common.welcome') }}</h1>
    <a-button @click="handleLocale('zh')">中文</a-button>
    <a-button @click="handleLocale('en')">English</a-button>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  setup() {
    const { locale } = useI18n()
    const handleLocale = (lang) => {
      locale.value = lang
      localStorage.setItem('locale', lang)
    }
    return {
      handleLocale
    }
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
