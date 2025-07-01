import { createI18n } from "vue-i18n";
import enLocale from "./en_US";
import frLocale from "./fr_FR";
import jaLocale from "./ja_JP";
import ptLocale from "./pt_BR";
import zhLocale from "./zh_CN";
import zhTwLocale from "./zh_TW";

const messages = {
  "en-US": {
    ...enLocale,
  },
  "zh-CN": {
    ...zhLocale,
  },
  ja_JP: {
    ...jaLocale,
  },
  zh_TW: {
    ...zhTwLocale,
  },
  pt_BR: {
    ...ptLocale,
  },
  fr_FR: {
    ...frLocale,
  },
};
let lang = navigator.language || "en-US";

if (!messages.hasOwnProperty(lang)) {
  lang = "en-US"
}

const i18n = createI18n({
  legacy: false,
  locale: lang || 'zh-CN"', // 默认cn语言环境
  globalInjection: true,
  messages,
});

export default i18n;
export const $t = (key: string) => i18n.global.t(key)
export const getLocale = () => i18n.global.locale.value
export const setLocale = (locale: string) => {
  (i18n.global.locale as any).value = locale
}
