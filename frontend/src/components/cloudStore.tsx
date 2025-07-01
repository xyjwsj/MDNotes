import {reactive} from "vue";
import {ConfigStore, PreferenceInfo} from "@/bindings/changeme/handler/systemhandler.ts";
import {ModalView, ShowModal} from "@/util/modalUtil.tsx";
import {TipSuccess, TipWarning} from "@/util/messageUtil.tsx";
import styled from "vue3-styled-components";
import {Input} from "ant-design-vue";
import {settingInfoStore} from "@/store/modules/settings.ts";
import { $t } from '@/lang'

const InputView = styled(Input)`
            background-color: ${() =>
    settingInfoStore.DarkTheme()
        ? "rgba(255, 255, 255, 0.2)"
        : "rgba(255, 255, 255, 0.6)"};
            margin: 5px 0;
            color: ${() =>
    settingInfoStore.DarkTheme() ? "rgba(255, 255, 255, 0.8)" : "gray"};

            .ant-input {
                &::placeholder {
                    color: ${() =>
    settingInfoStore.DarkTheme() ? "rgba(255, 255, 255, 0.4)" : "gray"};
                }
            }

            &:hover {
                background-color: ${() =>
    settingInfoStore.DarkTheme()
        ? "rgba(255, 255, 255, 0.4)"
        : "#fafafa"};
            }

            &:focus {
                background-color: ${() =>
    settingInfoStore.DarkTheme() ? "rgba(255, 255, 255, 0.4)" : "white"};
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