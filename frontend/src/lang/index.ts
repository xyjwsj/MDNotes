import {createI18n} from "vue-i18n"
import enLocale from "./en"
import zhLocale from "./zh"

const messages = {
  'en-US': {
    ...enLocale
  },
  'zh-CN': {
    ...zhLocale
  },
}
const lang = (navigator.language || 'en').toLocaleLowerCase()

const i18n = createI18n({
  legacy: false,
  locale: lang || 'zh-CN"', // 默认cn语言环境
  messages
})

export default i18n