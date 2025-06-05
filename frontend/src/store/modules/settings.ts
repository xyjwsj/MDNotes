import {Store} from "@/store";

export interface SettingInfo {
    theme: string
}

const SETTING_INFO = "_SETTING_INFO"

export class SettingInfoStore extends Store<SettingInfo> {
    protected data(): SettingInfo {
        return {
            theme: 'dark1',
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
    }

}

const settingInfoStore = new SettingInfoStore()

export {
    settingInfoStore
}