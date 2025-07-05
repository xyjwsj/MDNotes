import {reactive} from "vue";
import {ModalView, ShowModal} from "@/util/modalUtil.tsx";
import styled from "vue3-styled-components";
import {settingInfoStore} from "@/store/modules/settings.ts";
import keyboardDark from "@/assets/png/keyboard-black.png";
import keyboardLight from "@/assets/png/keyboard-white.png";
import {Image} from "ant-design-vue";
import { $t } from '@/lang'
import {currentTheme} from "@/style/theme.ts";

const HotKeyView = styled.div`
            display: flex;
            flex-wrap: wrap;
            padding-left: 40px;
            justify-content: flex-start;
            align-items: center;

            .title {
                width: 100%;
                margin-top: 20px;
                color: ${() => currentTheme.value.colors.dialogTitle};
            }

            .item {
                width: 50%;
                line-height: 35px;
                display: flex;
                align-items: center;
                color: ${() => currentTheme.value.colors.dialogLabelText};
                gap: 3px;

                .key {
                    background-color: ${() => currentTheme.value.colors.dialogLabelBackground};
                    line-height: 20px;
                    padding: 0 5px;
                    border-radius: 3px;
                    color: ${() => currentTheme.value.colors.dialogLabel};
                }
            }
        `;

const hotKeyInfo = reactive([
    {
        desc: "",
        data: [
            {
                key: "⌘+N",
                descKey: "createFile",
            },
            {
                key: "⌘+D",
                descKey: "deleteFile",
            },
            {
                key: "⌘+R",
                descKey: "rename",
            },
            {
                key: "⌘+Shift+D",
                descKey: "deleteFileList",
            },
            {
                key: "⌘+↑",
                descKey: "selectUp",
            },
            {
                key: "⌘+↓",
                descKey: "selectDown",
            },
        ],
    },
    {
        desc: "editArea",
        data: [
            {
                key: "⌘+I",
                descKey: "insertTemplate",
            },
            {
                key: "⌘+E",
                descKey: "edit",
            },
        ],
    },
    {
        desc: "system",
        data: [
            {
                key: "Enter",
                descKey: "sure",
            },
            {
                key: "⌘+Shift+K",
                descKey: "showHotKey",
            },
            {
                key: "⌘+L",
                descKey: "language",
            },
            // {
            //     key: "⌘+Shift+L",
            //     descKey: "license",
            // },
            {
                key: "⌘+Shift+E",
                descKey: "export",
            },
            {
                key: "⌘+Shift+S",
                descKey: "configStore",
            },
            {
                key: "⌘+Shift+T",
                descKey: "changeTheme",
            },
            {
                key: "⌘+Shift+Left",
                descKey: "hiddenSidebar",
            },
            {
                key: "⌘+Shift+Right",
                descKey: "showSidebar",
            },
            {
                key: "⌘+Shift+C",
                descKey: "categoryManger",
            },
            {
                key: "⌘+Shift+H",
                descKey: "help",
            },
        ],
    },
]);

const HotKey = () => {
    const modalView = new ModalView();
    modalView.cancelText = "";
    modalView.okText = $t("exportCurrent");
    modalView.title = $t("hotKey");
    modalView.okText = "";
    modalView.closed = true;
    modalView.width = "700px";
    modalView.icon = (
        <Image
            preview={false}
            width={25}
            src={settingInfoStore.DarkTheme() ? keyboardLight : keyboardDark}
        />
    );
    modalView.content = (
        <HotKeyView>
            {hotKeyInfo.map((item) => {
                return (
                    <>
                        {item.desc !== "" && (
                            <span class={"title"}>{$t(item.desc)}</span>
                        )}
                        {item.data.map((itm) => {
                            const split = itm.key.split("+");
                            return (
                                <div class={"item"}>
                                    {split.map((it) => {
                                        return <span class={"key"}>{it}</span>;
                                    })}
                                    <span>{$t(itm.descKey)}</span>
                                </div>
                            );
                        })}
                    </>
                );
            })}
        </HotKeyView>
    );
    // modalView.show();
    ShowModal(modalView);
};

export {
    HotKey
}