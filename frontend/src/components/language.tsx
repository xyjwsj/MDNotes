import {DestroyModal, ModalView, ShowModal} from "@/util/modalUtil.tsx";
import {Image} from "ant-design-vue";
import {settingInfoStore} from "@/store/modules/settings.ts";
import langLight from "@/assets/png/language-light.png";
import langDark from "@/assets/png/language-dark.png";
import {reactive} from "vue";
import styled from "vue3-styled-components";
import {$t, setLocale} from '@/lang'
import {currentTheme} from "@/style/theme.ts";

const LanguageView = styled.div`
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-left: 34px;
            gap: 10px;
            height: 30%;
            overflow-y: auto;
            padding: 10px;

            ::-webkit-scrollbar {
                display: none;
            }

            .langItem {
                line-height: 40px;
                width: 95%;
                border-radius: 5px;
                text-align: center;
                color: ${() => currentTheme.value.colors.dialogItem};
                background-color: ${() => currentTheme.value.colors.dialogItemBackground};

                &:hover {
                    box-shadow: 0 0 5px 1px ${() => currentTheme.value.colors.dialogItemHoverShadow};
                    color: ${() => currentTheme.value.colors.dialogItemHover};
                }
            }
        `;

const languageInfo = reactive([
    {
        lang: "zh-CN",
        descKey: "chinese",
    },
    {
        lang: "en-US",
        descKey: "english",
    },
    {
        lang: "fr_FR",
        descKey: "french",
    },
    {
        lang: "pt_BR",
        descKey: "portuguese",
    },
    {
        lang: "ja_JP",
        descKey: "japanese",
    },
    {
        lang: "zh_TW",
        descKey: "traditional",
    },
]);

const ChangeLang = () => {
    const modalView = new ModalView();
    modalView.cancelText = "";
    modalView.okText = $t("exportCurrent");
    modalView.title = $t("language");
    modalView.okText = "";
    modalView.closed = true;
    modalView.width = "350px";
    modalView.icon = (
        <Image
            preview={false}
            width={25}
            src={settingInfoStore.DarkTheme() ? langLight : langDark}
        />
    );
    modalView.content = (
        <LanguageView>
            {languageInfo.map((item) => {
                return (
                    <span
                        class={"langItem"}
                        onClick={() => {
                            setLocale(item.lang)
                            settingInfoStore.UpdateLang(item.lang);
                            DestroyModal();
                        }}
                    >
                {$t(item.descKey)}
              </span>
                );
            })}
        </LanguageView>
    );
    // modalView.show();
    ShowModal(modalView);
};

export {
    ChangeLang
}