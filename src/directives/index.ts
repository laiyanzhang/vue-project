import { App, Directive } from 'vue'
import scroll from './scroll'

const directives: Record<string, Directive> = {
  scroll,
}

export default {
  install(app: App) {
    Object.entries(directives).forEach(([name, directive]) => {
      app.directive(name, directive)
    })
  }
}
