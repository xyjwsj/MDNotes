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
let lang = (navigator.language || 'en').toLocaleLowerCase()
const langArr = lang.split("-");
if (langArr.length > 0) {
  lang = langArr[0]
}

const i18n = createI18n({
  locale: lang || 'zh', // 默认cn语言环境
  messages
})

export default i18n