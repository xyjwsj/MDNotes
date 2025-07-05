import {reactive} from "vue";
import {ConfigStore, PreferenceInfo} from "@/bindings/changeme/handler/systemhandler.ts";
import {ModalView, ShowModal} from "@/util/modalUtil.tsx";
import {TipSuccess, TipWarning} from "@/util/messageUtil.tsx";
import styled from "vue3-styled-components";
import {Input} from "ant-design-vue";
import {$t} from '@/lang'
import {currentTheme} from "@/style/theme.ts";

const InputView = styled(Input)`
            background-color: ${() => currentTheme.value.colors.dialogInputBackground};
            margin: 5px 0;
            color: ${() => currentTheme.value.colors.dialogInput};

            .ant-input {
                &::placeholder {
                    color: ${() => currentTheme.value.colors.dialogInputPlaceholder};
                }
            }

            &:hover {
                background-color: ${() => currentTheme.value.colors.dialogInputHover};
            }

            &:focus {
                background-color: ${() => currentTheme.value.colors.dialogInputFocus};
            }
        `;

const settingInfo = reactive({
    url: "",
    username: "",
    token: "",
});

const ConfigStoreHandle = async () => {
    const info = await PreferenceInfo();
    settingInfo.username = info.username;
    settingInfo.url = info.remoteUrl;
    settingInfo.token = info.token;

    const modalView = new ModalView();
    modalView.width = 400;
    modalView.title = $t("configStore");
    modalView.okText = $t('sure')
    modalView.cancelText = $t('cancel')
    modalView.content = (
        <div>
            <InputView
                class={"inputC"}
                bordered={false}
                placeholder={`${$t("input")}${$t("remoteAddr")}(gitee)`}
                defaultValue={settingInfo.url}
                onChange={(e) => (settingInfo.url = e.target.value!)}
            ></InputView>
            <InputView
                class={"inputC"}
                bordered={false}
                placeholder={`${$t("input")}${$t("username")}`}
                defaultValue={settingInfo.username}
                onChange={(e) => (settingInfo.username = e.target.value!)}
            ></InputView>
            <InputView
                class={"inputC"}
                bordered={false}
                placeholder={`${$t("input")}TOKEN`}
                defaultValue={settingInfo.token}
                onChange={(e) => (settingInfo.token = e.target.value!)}
            ></InputView>
        </div>
    );
    modalView.ok = async () => {
        if (settingInfo.url === "") {
            TipWarning(`${$t("remoteAddr")}${$t("notConfig")}`);
            return;
        }
        if (settingInfo.username === "") {
            TipWarning(`${$t("username")}${$t("notConfig")}`);
            return;
        }
        if (settingInfo.token === "") {
            TipWarning(`TOKEN${$t("notConfig")}`);
            return;
        }
        const res = await ConfigStore(
            settingInfo.url,
            settingInfo.username,
            settingInfo.token
        );
        if (res) {
            TipSuccess(`${$t("config")}${$t("success")}`);
        } else {
            TipSuccess(`${$t("config")}${$t("failure")}`);
        }
    };

    // modalView.show();
    ShowModal(modalView);
};

export {
    ConfigStoreHandle
}