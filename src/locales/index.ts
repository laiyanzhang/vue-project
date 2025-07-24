import { createI18n } from 'vue-i18n'
import en from './en-US/index'
import zh from './zh-CN/index'

const messages = {
  en,
  zh
}

const lang = localStorage.getItem('locale') || 'zh'

const i18n = createI18n({
  legacy: false, // Vue3必须设置为false以支持组合式API[5,7](@ref)
  locale: lang, // 默认语言
  fallbackLocale: 'en', // 备用语言（当找不到翻译时使用）
  messages // 语言包
})

export const t = i18n.global.t
export default i18n