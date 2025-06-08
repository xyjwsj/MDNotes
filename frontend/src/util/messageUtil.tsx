import {message} from 'ant-design-vue'
import './message.css'
import {settingInfoStore} from "@/store/modules/settings.ts";

message.config({
  top: `49vh`,
  duration: 2,
  maxCount: 2,
  rtl: true,
});

const TipSuccess = (msg: string) => {
  message.success({
    content: msg,
    class: settingInfoStore.DarkTheme() ? 'modalDark' : '',
  })
}

const TipWarning = (msg: string) => {
  message.warning({
    content: msg,
    class: settingInfoStore.DarkTheme() ? 'modalDark' : '',
  })
}

const TipError = (msg: string) => {
  message.error({
    content: msg,
    class: settingInfoStore.DarkTheme() ? 'modalDark' : '',
  })
}

export {
  TipSuccess,
  TipWarning,
  TipError
}