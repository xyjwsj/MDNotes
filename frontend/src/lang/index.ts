import {createI18n} from "vue-i18n"
import enLocale from "./en"
import zhLocale from "./zh"

const messages = {
  en: {
    ...enLocale
  },
  zh: {
    ...zhLocale
  },
}
const lang = (navigator.language || 'en').toLocaleLowerCase()

const i18n = createI18n({
  locale: lang || 'zh', // 默认cn语言环境
  messages
})

export default i18n