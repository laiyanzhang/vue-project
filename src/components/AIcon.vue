<!-- src/components/AIcon.vue -->
<template>
  <component :is="icon" v-bind="$attrs" />
</template>

<script setup>
import * as Icons from '@ant-design/icons-vue'
import { computed, defineProps } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

const icon = computed(() => Icons[props.name])
</script>