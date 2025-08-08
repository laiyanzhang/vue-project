<template>
  <div class="page">
    <a-menu
      v-model:selectedKeys="selectedKeys"
      theme="dark"
      :items="items"
      @click="handleClick"
      class="sider"
    ></a-menu>
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue'
import { routes } from '@/router'
import { useRouter, useRoute } from 'vue-router'

export default defineComponent({
  setup() {
    const items = ref([])
    const router = useRouter()
    const currentRoute = useRoute()
    const selectedKeys = computed(() => [currentRoute.path])
    routes.forEach((route) => {
      const item = {
        key: route.path,
        label: route.name
      }
      items.value.push(item)
    });

    const handleClick = (event) => {
      router.push(event.key)
    }
    return {
      items,
      selectedKeys,
      handleClick
    }
  },
})
</script>


<style lang="less" scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

.page {
  width: 100%;
  height: 100vh;
  display: flex;
  .sider {
    width: 200px;
  }
  .content {
    flex: 1;
    height: 100%;
    overflow: auto;
  }
}
</style>
