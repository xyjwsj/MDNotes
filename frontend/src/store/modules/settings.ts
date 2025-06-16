import {Store} from "@/store";

export interface SettingInfo {
    theme: string
    lang: string
}

const SETTING_INFO = "_SETTING_INFO"

export class SettingInfoStore extends Store<SettingInfo> {
    protected data(): SettingInfo {
        return {
            theme: 'light',
            lang: 'en-US'
        }
    }
    protected key(): string {
        return SETTING_INFO
    }

    public DarkTheme() {
        return this.state.theme === 'dark'
    }

    public SwitchTheme() {
        if (this.state.theme === 'dark') {
            this.state.theme = 'light'
        } else {
            this.state.theme = 'dark'
        }
        this.updateState()
    }

    public UpdateLang(lang: string) {
        this.state.lang = lang
        this.updateState()
    }

}

const settingInfoStore = new SettingInfoStore()

export {
    settingInfoStore
}