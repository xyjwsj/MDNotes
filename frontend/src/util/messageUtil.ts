import { message } from 'ant-design-vue'

message.config({
  top: `49vh`,
  duration: 2,
  maxCount: 2,
  rtl: true,
});

const TipSuccess = (msg: string) => {
  message.info(msg)
}

const TipWarning = (msg: string) => {
  message.warning(msg)
}

const TipError = (msg: string) => {
  message.error(msg)
}

export {
  TipSuccess,
  TipWarning,
  TipError
}