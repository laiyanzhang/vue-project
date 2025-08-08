import { DirectiveBinding } from 'vue'

interface ScrollOptions {
  distance: number
  debounce: number
  handler?: () => void
}

interface ElementData {
  options: ScrollOptions | null
  listener: ((this: HTMLElement, ev: Event) => any) | null
  timer: ReturnType<typeof setTimeout> | null
}

// 默认配置
const DEFAULT_OPTIONS: ScrollOptions = {
  distance: 50,
  debounce: 200
}

// 解析参数
function parseOptions(bindingValue: any): ScrollOptions {
  if (typeof bindingValue === 'function') {
    return { ...DEFAULT_OPTIONS, handler: bindingValue }
  }
  return { ...DEFAULT_OPTIONS, ...bindingValue }
}

// WeakMap存储元素相关数据（避免内存泄漏）
const elementDataMap = new WeakMap<HTMLElement, ElementData>()

function getElementData(el: HTMLElement): ElementData {
  if (!elementDataMap.has(el)) {
    elementDataMap.set(el, {
      options: null,
      listener: null,
      timer: null
    })
  }
  // 非空断言，因为上面已 set
  return elementDataMap.get(el) as ElementData
}

// 核心代码：监听当前元素是否滚动到底部
function createScrollHandler(el: HTMLElement, handler: () => void) {
  const data = getElementData(el)

  return function () {
    if (data.timer) clearTimeout(data.timer)

    data.timer = setTimeout(() => {
      const { scrollHeight, scrollTop, clientHeight } = el
      const remaining = scrollHeight - scrollTop - clientHeight

      if (data.options && remaining <= data.options.distance) handler()
    }, data.options?.debounce)
  }
}

// 绑定时绑定事件监听、时间器以及绑定元素
function bindScrollListener(el: HTMLElement, binding: DirectiveBinding) {
  const data = getElementData(el)
  const options = parseOptions(binding.value)

  // 清理旧的监听器
  if (data.listener) {
    el.removeEventListener('scroll', data.listener)
    if (data.timer) clearTimeout(data.timer)
  }

  // 存储新配置
  data.options = options

  if (!options.handler) return

  // 创建新监听器
  data.listener = createScrollHandler(el, options.handler)
  el.addEventListener('scroll', data.listener)
}

// 解绑时清除事件监听、时间器以及绑定元素
function unbindScrollListener(el: HTMLElement) {
  const data = getElementData(el)
  if (data.listener) el.removeEventListener('scroll', data.listener)
  if (data.timer) clearTimeout(data.timer)
  elementDataMap.delete(el)
}

export default {
  mounted: bindScrollListener,
  updated(el: HTMLElement, binding: DirectiveBinding) {
    if (binding.oldValue !== binding.value) {
      bindScrollListener(el, binding)
    }
  },
  unmounted: unbindScrollListener
}
