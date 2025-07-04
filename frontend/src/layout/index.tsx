import keyboardDark from "@/assets/png/keyboard-black.png";
import keyboardLight from "@/assets/png/keyboard-white.png";
import langDark from "@/assets/png/language-dark.png";
import langLight from "@/assets/png/language-light.png";
import mdIcon from "@/assets/png/markdown.png";
import garbageLightIcon from '@/assets/png/garbage-light.png'
import garbageDarkIcon from '@/assets/png/garbage-black.png'
import {
    ChangeTag,
    CreateFile,
    DeleteFile,
    DeleteList,
    DocList,
    ModifyName,
    Recovery,
    Search,
} from "@/bindings/changeme/handler/filehandler.ts";
import {ConfigStore, HelpInfo, PreferenceInfo, ScreenFullSwitch,} from "@/bindings/changeme/handler/systemhandler.ts";
import {RecordInfo} from "@/bindings/changeme/model";
import {settingInfoStore} from "@/store/modules/settings.ts";
import {TipError, TipSuccess, TipWarning} from "@/util/messageUtil.tsx";
import {DestroyModal, ModalView, OkModal, ShowModal,} from "@/util/modalUtil.tsx";
import {
    BulbOutlined,
    CheckOutlined,
    CloseOutlined,
    CloudUploadOutlined,
    DeleteOutlined,
    DribbbleOutlined,
    ExportOutlined,
    LayoutOutlined,
    MoreOutlined,
    PlusOutlined,
    QuestionOutlined,
    SearchOutlined,
    TagOutlined,
    UndoOutlined,
} from "@ant-design/icons-vue";
import {Dropdown, Image, Input, Menu, MenuItem, Popover,} from "ant-design-vue";
import Mousetrap from "mousetrap";
import {
    defineComponent,
    KeepAlive,
    nextTick,
    onMounted,
    onUnmounted,
    provide,
    reactive,
    ref,
    Transition,
    TransitionGroup,
} from "vue";
import {useI18n} from "vue-i18n";
import {RouterView} from "vue-router";
import styled from "vue3-styled-components";

export default defineComponent({
    name: "Layout",
    setup(_) {
        const Container = styled.div`
            margin: 0 auto;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
        `;

        const ToolView = styled.div`
            height: 40px;
            width: calc(100% - 80px);
            background-color: ${() =>
                    settingInfoStore.DarkTheme() ? "#2d2f32" : "#e9e9ed"};
            padding-left: 80px;
            display: flex;
            align-items: center;
            //background-color: red;
            justify-content: space-between;
            flex-direction: row;
            position: relative;

            .fileTitle {
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;

                .file {
                    font-size: 13px;
                    color: ${() => (settingInfoStore.DarkTheme() ? "lightgray" : "gray")};
                }

                .tag {
                    width: 10px;
                    height: 10px;
                    border-radius: 5px;
                    background-color: aliceblue;
                }
            }

            .title {
                width: 130px;
                height: 40px;
                text-align: right;
                padding-right: 20px;
                line-height: 45px;
                font-weight: 600;
                display: flex;
                font-size: 18px;
                align-items: center;
                justify-content: flex-end;
                position: relative;
                gap: 15px;

                .zoom-enter-active {
                    animation: zoomIn 0.3s ease;
                }

                .zoom-leave-active {
                    animation: zoomOut 0.3s ease forwards;
                }

                @keyframes zoomIn {
                    from {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                .name {
                    font-size: 14px;
                    margin-right: 20px;
                    color: ${() => (settingInfoStore.DarkTheme() ? "white" : "gray")};
                }

                .add {
                    line-height: 40px;
                    color: ${() =>
                            settingInfoStore.DarkTheme()
                                    ? "rgba(255, 255, 255, 0.4)"
                                    : "rgba(0, 0, 0, 0.4)"};

                    &:hover {
                        color: ${() =>
                                settingInfoStore.DarkTheme()
                                        ? "rgba(255, 255, 255, 0.8)"
                                        : "rgba(0, 0, 0, 0.7)"};
                    }
                }

                .search {
                    position: absolute;
                    background-color: ${() =>
                            settingInfoStore.DarkTheme() ? "#242424" : "#fafafa"};
                    border-radius: 15px;
                    height: 25px;
                    width: 80%;
                    z-index: ${() => (search.value ? 1 : -1)};

                    .ant-input {
                        padding-left: 10px;
                        color: ${() =>
                                settingInfoStore.DarkTheme() ? "white" : "rgba(0, 0, 0, 0.6)"};

                        &::placeholder {
                            color: ${() =>
                                    settingInfoStore.DarkTheme()
                                            ? "rgba(255, 255, 255, 0.3)"
                                            : "rgba(0, 0, 0, 0.4)"};
                        }
                    }

                    /* 添加宽度过渡动画 */

                    &.expand-enter-active,
                    &.expand-leave-active {
                        transition: width 0.5s ease;
                        overflow: hidden;
                    }

                    &.expand-enter-from,
                    &.expand-leave-to {
                        width: 0;
                    }

                    &.expand-enter-to,
                    &.expand-leave-from {
                        width: 100%;
                    }
                }
            }

            .tools {
                    /* background-color: ${() =>
                        settingInfoStore.DarkTheme()
                                ? "#2b2d31"
                                : "rgba(239, 239, 242, 0.6)"}; */
                height: 40px;
                display: flex;
                justify-content: flex-end;
                align-items: center;
                padding: 0 20px;
                //z-index: 99;
                //width: calc(100% - 145px);
                flex: 1;

                .create {
                    font-size: 12px;
                    color: gray;
                }

                .actions {
                    height: 45px;
                    color: lightgray;
                    font-size: 17px;
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    gap: 20px;

                    .action {
                        height: 45px;
                        color: ${() =>
                                settingInfoStore.DarkTheme() ? "gray" : "rgba(0, 0, 0, 0.4)"};
                        font-size: 17px;
                        display: flex;
                        justify-content: flex-end;
                        align-items: center;

                        &:hover {
                            color: ${() =>
                                    settingInfoStore.DarkTheme()
                                            ? "lightgray"
                                            : "rgba(0, 0, 0, 0.7)"};
                        }
                    }
                }
            }
        `;

        const BodyView = styled.div`
            width: 100%;
            height: calc(100% - 40px);
            display: flex;
            position: relative;
        `;

        const ListView = styled.div`
            width: ${() => (showList.value ? "230px" : 0)};
            background-color: ${() =>
                    settingInfoStore.DarkTheme() ? "#2b2d30" : "#efeff2"};
            height: 100%;
            display: flex;
            flex-direction: column;
            //align-items: center;
            transition: width 0.5s ease;
            overflow: hidden; /* 防止内容溢出时动画异常 */
            position: relative;

            .footer {
                height: 20px;
                font-size: 11px;
                color: ${() =>
                        settingInfoStore.DarkTheme() ? "rgba(255, 255, 255, 0.4)" : "gray"};
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                bottom: 0;
            }

            .selectDefault {
                line-height: 35px;
                width: 190px;
                padding: 0 20px;
                font-size: 14px;
                display: flex;
                position: relative;
                color: ${() =>
                        settingInfoStore.DarkTheme()
                                ? "rgba(255, 255, 255, 0.6)"
                                : "rgba(48, 48, 45, 1)"};
                justify-content: space-between;

                &:hover {
                    background-color: ${() =>
                            settingInfoStore.DarkTheme() ? "#323233" : "#e7e7ea"};
                }

                .tag {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    background-color: red;
                    right: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    border-radius: 5px;
                }

                .editInput {
                    height: 35px;

                    .ant-input {
                        color: ${() =>
                                settingInfoStore.DarkTheme()
                                        ? "rgba(255, 255, 255, 0.9)"
                                        : "black"};
                    }
                }

                .left {
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    gap: 5px;
                }

                .right {
                    font-size: 12px;
                    padding-right: 10px;
                    color: ${() =>
                            settingInfoStore.DarkTheme() ? "rgba(255, 255, 255, 0.4)" : "gray"};
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    gap: 3px;
                }
            }

            .select {
                background-color: ${() =>
                        settingInfoStore.DarkTheme() ? "#43454A" : "#e0e0e3"};
            }
        `;

        const GarbageView = styled.div`
            position: absolute;
            bottom: -28px;
            width: 50px;
            height: 50px;
            left: -28px;
            opacity: 0.5;
            padding-right: 10px;
            padding-top: 10px;
            background-color: ${() => settingInfoStore.DarkTheme() ? 'rgba(0, 0, 0, 0.3)' : 'lightgray'};
            display: flex;
            align-items: flex-start;
            justify-content: flex-end;
            border-radius: 50px;
            z-index: 10;

            transition: transform 0.3s ease;

            &:hover {
                opacity: 0.9;
                box-shadow: 0 0 5px 2px ${() => settingInfoStore.DarkTheme() ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.3)'};
                transform: translate(5px, -5px);
            }
        `

        const TransitionGroupCon = styled(TransitionGroup)`
            width: 230px;
            height: 100%;
            flex: 1;
            /* fade */

            .fade-enter-active,
            .fade-leave-active {
                transition: opacity 0.5s ease;
            }

            .fade-enter-from,
            .fade-leave-to {
                opacity: 0;
            }
        `;

        const RouterViewCon = styled.div`
            min-height: 500px; /* 固定最小高度，防抖动 */
            overflow-y: auto;
            //width: calc(100% - 50px);
            flex: 1;
            //width: 100%;

            ::-webkit-scrollbar {
                display: none;
            }

            /* 路由切换动画 */

            .fade-enter-active,
            .fade-leave-active {
                transition: all 0.5s ease-in-out;
                transform: translate3d(0, 0, 0); /* 启用GPU加速 */
                backface-visibility: hidden; /* 防止闪烁 */
                perspective: 1000px;
            }

            .fade-enter-from {
                opacity: 0;
                transform: translateY(-30px);
            }

            .fade-enter-to {
                opacity: 1;
                transform: translateY(0);
            }

            .fade-leave-to {
                opacity: 0;
                transform: translateY(30px);
            }
        `;

        const {t, locale} = useI18n();

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

        const HotKeyView = styled.div`
            display: flex;
            flex-wrap: wrap;
            padding-left: 40px;
            justify-content: flex-start;
            align-items: center;

            .title {
                width: 100%;
                margin-top: 20px;
                color: ${() =>
                        settingInfoStore.DarkTheme() ? "rgba(255, 255, 255, 0.8)" : "gray"};
            }

            .item {
                width: 50%;
                line-height: 35px;
                color: ${() =>
                        settingInfoStore.DarkTheme()
                                ? "rgba(255, 255, 255, 0.8)"
                                : "rgba(0, 0, 0, 0.8)"};
                display: flex;
                align-items: center;
                gap: 3px;

                .key {
                    background-color: ${() =>
                            settingInfoStore.DarkTheme() ? "rgba(0, 0, 0, 0.7)" : "lightgray"};
                    line-height: 20px;
                    padding: 0 5px;
                    border-radius: 3px;
                    color: ${() =>
                            settingInfoStore.DarkTheme()
                                    ? "rgba(255, 255, 255, 0.7)"
                                    : "rgba(0, 0, 0, 0.8)"};
                }
            }
        `;

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
                color: ${() =>
                        settingInfoStore.DarkTheme() ? "rgba(255, 255, 255, 0.6)" : "gray"};
                background-color: ${() =>
                        settingInfoStore.DarkTheme()
                                ? "rgba(255, 255, 255, 0.2)"
                                : "rgba(255, 255, 255, 0.7)"};

                &:hover {
                    box-shadow: 0 0 5px 1px ${() =>
                            settingInfoStore.DarkTheme()
                                    ? "rgba(255, 255, 255, 0.8)"
                                    : "gray"};
                    color: ${() =>
                            settingInfoStore.DarkTheme()
                                    ? "rgba(255, 255, 255, 0.8)"
                                    : "rgba(0, 0, 0, 0.8)"};
                }
            }
        `;

        const MenuItemView = styled(MenuItem)`
            color: ${() =>
                    settingInfoStore.DarkTheme()
                            ? "gray"
                            : "rgba(0, 0, 0, 0.4)"} !important;

            &:hover {
                color: ${() =>
                        settingInfoStore.DarkTheme()
                                ? "lightgray"
                                : "rgba(0, 0, 0, 0.7)"} !important;
            }
        `;

        const PopoverView = styled(Popover)`

            :global(.ant-popover-arrow) {
                &:before {
                    background: ${() => settingInfoStore.DarkTheme() ? 'rgba(0, 0, 0, 0.3)' : 'lightgray'} !important;
                }
            }

            :global(.ant-popover-inner) {
                background-color: ${() => settingInfoStore.DarkTheme() ? 'rgba(0, 0, 0, 0.3)' : 'lightgray'} !important;
            }
        `;

        const TagView = styled.div`
            display: flex;
            flex-direction: row;
            align-items: center;
            //background-color: gray;
            gap: 12px;

            span {
                width: 14px;
                height: 14px;
                border-radius: 7px;
                background-color: red;

                &:hover {
                    box-shadow: 0 0 3px 2px ${() => settingInfoStore.DarkTheme() ? 'gray' : 'rgba(0, 0, 0, 0.5)'};
                }
            }
        `;

        // const showLicense: any = inject("showLicense");

        const search = ref(false);
        const showList = ref(true);
        const fileList = ref<RecordInfo[]>([]);

        const selectFileKey = ref("");
        const editFileKey = ref("");
        const tempInfo = reactive({
            name: "",
        });

        const currentCom = ref<any>(null);

        const fileName = () => {
            const res = fileList.value.filter(
                (item) => item.uuid === selectFileKey.value
            );
            if (res.length == 0) {
                return "";
            }
            return res[0].fileName;
        };

        const updateFileName = () => {
            const res = fileList.value.filter(
                (item) => item.uuid === selectFileKey.value
            );
            if (res.length == 0) {
                return;
            }
            if (currentCom.value) {
                console.log("$$$$$$$$", currentCom);
                currentCom.value.updateContent(res[0]);
            }
        };

        const keyEvent = () => {
            Mousetrap.bind("esc", () => {
                DestroyModal();
            });
            Mousetrap.bind("enter", () => {
                OkModal();
            });
            Mousetrap.bind("command+shift+k", () => {
                // TipWarning('快捷键')
                hotKey();
            });
            Mousetrap.bind("command+n", () => {
                createFile();
            });
            Mousetrap.bind("command+d", () => {
                deleteFile();
            });
            Mousetrap.bind("command+r", () => {
                rename();
            });

            Mousetrap.bind("command+l", () => {
                changeLang();
            });

            Mousetrap.bind("command+e", () => {
                currentCom.value.startEdit();
            });

            Mousetrap.bind("command+up", () => {
                selectFile(true);
            });

            Mousetrap.bind("command+down", () => {
                selectFile(false);
            });

            Mousetrap.bind("command+shift+l", () => {
                // showLicense();
            });
            Mousetrap.bind("command+shift+e", () => {
                // exportFile();
                fileExport()
            });
            Mousetrap.bind("command+shift+c", () => {
                configStore();
            });
            Mousetrap.bind("command+shift+t", () => {
                SwitchTheme();
            });
            Mousetrap.bind("command+shift+left", () => {
                showList.value = false;
            });
            Mousetrap.bind("command+shift+right", () => {
                showList.value = true;
            });
            Mousetrap.bind("command+shift+d", () => {
                showDelFile()
            });
            Mousetrap.bind("command+shift+h", () => {
                // showHelp()
            });
            Mousetrap.bind("command+shift+p", () => {
                // fileExport()
            });
        };

        let timer: any | null = null;
        let timestamp = 0;

        const startUpdateTask = () => {
            timestamp = Date.now();
            if (timer !== null) {
                return;
            }
            timer = setInterval(() => {
                if (Date.now() - timestamp > 800) {
                    clearInterval(timer);
                    updateFileName();
                    timer = null;
                }
            }, 500);
        };

        const selectFile = (previous: boolean) => {
            let itemIdx = -1;
            fileList.value.forEach((item, idx) => {
                if (item.uuid === selectFileKey.value) {
                    itemIdx = idx;
                    return;
                }
            });
            previous ? itemIdx-- : itemIdx++;
            if (itemIdx < 0) {
                selectFileKey.value = fileList.value[0].uuid;
            } else if (itemIdx > fileList.value.length - 1) {
                selectFileKey.value = fileList.value[fileList.value.length - 1].uuid;
            } else {
                selectFileKey.value = fileList.value[itemIdx].uuid;
            }
            startUpdateTask();
        };

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
                        key: "⌘+Shift+C",
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
                        key: "⌘+Shift+H",
                        descKey: "help",
                    },
                ],
            },
        ]);

        const hotKey = () => {
            const modalView = new ModalView();
            modalView.cancelText = "";
            modalView.okText = t("exportCurrent");
            modalView.title = t("hotKey");
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
                                    <span class={"title"}>{t(item.desc)}</span>
                                )}
                                {item.data.map((itm) => {
                                    const split = itm.key.split("+");
                                    return (
                                        <div class={"item"}>
                                            {split.map((it) => {
                                                return <span class={"key"}>{it}</span>;
                                            })}
                                            <span>{t(itm.descKey)}</span>
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

        onMounted(async () => {
            keyEvent();
            const docs = await DocList();
            fileList.value.splice(0, fileList.value.length);
            docs.forEach((item) => {
                if (item !== null) {
                    fileList.value.push(item);
                }
            });
            if (docs.length > 0) {
                selectFileKey.value = docs[0]?.uuid!;
                setTimeout(() => {
                    updateFileName();
                }, 300);
            }
        });

        onUnmounted(() => {
        });

        const renameCom = ref<any>(null);

        const rename = () => {
            const filter = fileList.value.filter(
                (item) => item.uuid === selectFileKey.value
            );
            if (filter.length > 0) {
                editFileKey.value = selectFileKey.value;
                tempInfo.name = filter[0].fileName;
                // renameCom.value.focus()
                updateFileName();
                nextTick(() => {
                    const inputEl = renameCom.value?.$el?.querySelector("input");
                    if (inputEl) {
                        inputEl.focus();
                        inputEl.select();
                    }
                });
            }
        };

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

        const deleteFile = () => {
            if (selectFileKey.value === "") {
                TipWarning(t("selectFile"));
                return;
            }
            const modalView = new ModalView();
            modalView.okText = t('sure')
            modalView.cancelText = t('cancel')
            modalView.title = t('delete')
            const files = fileList.value.filter(
                (item) => item.uuid === selectFileKey.value
            );
            if (files.length > 0) {
                const contentStr = `${t("confirmDelete")} '${files[0].fileName}' ${t(
                    "file"
                )}？`;
                modalView.content = (
                    <span
                        style={{color: settingInfoStore.DarkTheme() ? "white" : "black"}}
                    >
            {contentStr}
          </span>
                );
            }
            modalView.icon = (
                <DeleteOutlined
                    style={{color: settingInfoStore.DarkTheme() ? "white" : "black"}}
                />
            );
            modalView.ok = async () => {
                const res = await DeleteFile(selectFileKey.value);
                if (!res) {
                    TipWarning(t("deleteFailure"));
                    return;
                }
                // 再从本地列表中过滤掉该条目
                let index = fileList.value.findIndex(
                    (item) => item.uuid === selectFileKey.value
                );
                if (index !== -1) {
                    fileList.value.splice(index, 1);
                }

                index--;
                if (index < 0) {
                    index = 0;
                }

                selectFileKey.value = fileList.value[index].uuid;
                updateFileName();
            };
            // modalView.show();
            ShowModal(modalView);
        };

        // const exportFile = () => {
        //     const modalView = new ModalView();
        //     modalView.cancelText = t("exportAll");
        //     modalView.okText = t("exportCurrent");
        //     modalView.title = t("export");
        //     modalView.closed = true;
        //     modalView.icon = (
        //         <ExportOutlined
        //             style={{color: settingInfoStore.DarkTheme() ? "white" : "black"}}
        //         />
        //     );
        //     modalView.content = (
        //         <span
        //             style={{color: settingInfoStore.DarkTheme() ? "white" : "black"}}
        //         >
        //   {t("selectExport")}
        // </span>
        //     );
        //     modalView.ok = async () => {
        //         if (selectFileKey.value === "") {
        //             TipWarning(t("selectFile"));
        //             return;
        //         }
        //         if (await ExportFile(false, selectFileKey.value)) {
        //             TipSuccess(`${t("exportCurrent")}${t("success")}`);
        //         } else {
        //             TipSuccess(`${t("exportCurrent")}${t("failure")}`);
        //         }
        //     };
        //     modalView.cancel = async () => {
        //         if (await ExportFile(true, selectFileKey.value)) {
        //             TipSuccess(`${t("exportAll")}${t("success")}`);
        //         } else {
        //             TipSuccess(`${t("exportAll")}${t("failure")}`);
        //         }
        //     };
        //     // modalView.show();
        //     ShowModal(modalView);
        // };

        const updateFileSize = (key: string, sizeStr: string) => {
            fileList.value.forEach((item) => {
                if (item.uuid === key) {
                    item.sizeStr = sizeStr;
                }
            });
        };

        const settingInfo = reactive({
            url: "",
            username: "",
            token: "",
        });

        const configStore = async () => {
            const info = await PreferenceInfo();
            settingInfo.username = info.username;
            settingInfo.url = info.remoteUrl;
            settingInfo.token = info.token;

            const modalView = new ModalView();
            modalView.width = 400;
            modalView.title = t("configStore");
            modalView.okText = t('sure')
            modalView.cancelText = t('cancel')
            modalView.content = (
                <div>
                    <InputView
                        class={"inputC"}
                        bordered={false}
                        placeholder={`${t("input")}${t("remoteAddr")}(gitee)`}
                        defaultValue={settingInfo.url}
                        onChange={(e) => (settingInfo.url = e.target.value!)}
                    ></InputView>
                    <InputView
                        class={"inputC"}
                        bordered={false}
                        placeholder={`${t("input")}${t("username")}`}
                        defaultValue={settingInfo.username}
                        onChange={(e) => (settingInfo.username = e.target.value!)}
                    ></InputView>
                    <InputView
                        class={"inputC"}
                        bordered={false}
                        placeholder={`${t("input")}TOKEN`}
                        defaultValue={settingInfo.token}
                        onChange={(e) => (settingInfo.token = e.target.value!)}
                    ></InputView>
                </div>
            );
            modalView.ok = async () => {
                if (settingInfo.url === "") {
                    TipWarning(`${t("remoteAddr")}${t("notConfig")}`);
                    return;
                }
                if (settingInfo.username === "") {
                    TipWarning(`${t("username")}${t("notConfig")}`);
                    return;
                }
                if (settingInfo.token === "") {
                    TipWarning(`TOKEN${t("notConfig")}`);
                    return;
                }
                const res = await ConfigStore(
                    settingInfo.url,
                    settingInfo.username,
                    settingInfo.token
                );
                if (res) {
                    TipSuccess(`${t("config")}${t("success")}`);
                } else {
                    TipSuccess(`${t("config")}${t("failure")}`);
                }
            };

            // modalView.show();
            ShowModal(modalView);
        };

        provide("updateFileSize", updateFileSize);

        const okModify = () => {
            fileList.value.forEach((item) => {
                if (item.uuid === editFileKey.value) {
                    item.fileName = tempInfo.name;
                }
            });
            ModifyName(editFileKey.value, tempInfo.name);
            tempInfo.name = "";
            editFileKey.value = "";
            updateFileName();
        };

        const searchDoc = async (name: string) => {
            const searchList = await Search(name);
            fileList.value.splice(0, fileList.value.length);
            searchList.forEach((item) => {
                if (item !== null) {
                    fileList.value.push(item);
                }
            });
        };

        const SwitchTheme = () => {
            settingInfoStore.SwitchTheme();
            if (currentCom.value) {
                (currentCom.value as any).updateTheme();
            }
        };


        const ExportView = styled.div`
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-right: 20px;
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
                color: ${() =>
            settingInfoStore.DarkTheme() ? "rgba(255, 255, 255, 0.6)" : "gray"};
                background-color: ${() =>
            settingInfoStore.DarkTheme()
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(255, 255, 255, 0.7)"};

                &:hover {
                    box-shadow: 0 0 5px 1px ${() =>
            settingInfoStore.DarkTheme()
                ? "rgba(255, 255, 255, 0.8)"
                : "gray"};
                    color: ${() =>
            settingInfoStore.DarkTheme()
                ? "rgba(255, 255, 255, 0.8)"
                : "rgba(0, 0, 0, 0.8)"};
                }
            }
        `;

        const exportTypeInfo = reactive([
            {
                key: 'html',
                val: 'HTML',
            },
            {
                key: 'pdf',
                val: 'PDF',
            },
            {
                key: 'word',
                val: 'Word',
            },
            {
                key: 'md',
                val: 'MarkDown'
            }
        ]);


        const fileExport = () => {
            const modalView = new ModalView();
            modalView.cancelText = "";
            modalView.okText = "";
            modalView.title = t("export");
            modalView.okText = "";
            modalView.closed = true;
            modalView.width = "350px";
            modalView.icon = (
                <ExportOutlined
                    style={{color: settingInfoStore.DarkTheme() ? "white" : "black"}}
                />
            );
            modalView.content = (
                <ExportView>
                    {exportTypeInfo.map((item) => {
                        return (
                            <span
                                class={"langItem"}
                                onDblclick={() => {
                                    if (currentCom.value) {
                                        currentCom.value.exportHtml(item.key);
                                    }
                                    DestroyModal();
                                }}
                            >
                {t(item.val)}
              </span>
                        );
                    })}
                </ExportView>
            );
            // modalView.show();
            ShowModal(modalView);
        };

        const changeLang = () => {
            const modalView = new ModalView();
            modalView.cancelText = "";
            modalView.okText = t("exportCurrent");
            modalView.title = t("language");
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
                                onDblclick={() => {
                                    locale.value = item.lang;
                                    settingInfoStore.UpdateLang(locale.value);
                                    DestroyModal();
                                }}
                            >
                {t(item.descKey)}
              </span>
                        );
                    })}
                </LanguageView>
            );
            // modalView.show();
            ShowModal(modalView);
        };

        const createFile = async () => {
            const file = await CreateFile();
            fileList.value.push(file);
            selectFileKey.value = file.uuid;
            updateFileName();
        };

        const tagColor = [
            "orange",
            "yellow",
            "red",
            "green",
            "blue",
            "purple",
            "gray",
        ];

        const changeTag = async (color: string) => {
            if (color === "" || selectFileKey.value === "") {
                return;
            }
            const res = await ChangeTag(selectFileKey.value, color);
            if (res) {
                fileList.value.forEach((item) => {
                    if (item.uuid === selectFileKey.value) {
                        item.tag = color;
                        return;
                    }
                });
            }
        };

        const DeleteView = styled.div`
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            //margin-left: 50px;
            position: relative;
            text-align: center;
            padding: 10px 0;
            width: 510px;
            gap: 8px;
            max-height: 350px;
            overflow-y: auto;

            ::-webkit-scrollbar {
                display: none;
            }

            .item {
                width: 80%;
                line-height: 35px;
                padding: 0 10px;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                border-radius: 8px;

                color: ${() =>
                        settingInfoStore.DarkTheme() ? "rgba(255, 255, 255, 0.6)" : "gray"};
                background-color: ${() =>
                        settingInfoStore.DarkTheme()
                                ? "rgba(255, 255, 255, 0.2)"
                                : "rgba(255, 255, 255, 0.7)"};

                &:hover {
                    box-shadow: 0 0 5px 1px ${() =>
                            settingInfoStore.DarkTheme()
                                    ? "rgba(255, 255, 255, 0.8)"
                                    : "gray"};
                    color: ${() =>
                            settingInfoStore.DarkTheme()
                                    ? "rgba(255, 255, 255, 0.8)"
                                    : "rgba(0, 0, 0, 0.8)"};
                }
            }

            .right {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 10px;

                .time {
                    font-size: 12px;
                }
            }
        `

        const showDelFile = async () => {
            const modalView = new ModalView();
            modalView.cancelText = "";
            modalView.okText = "";
            modalView.title = t("deleteFileList");
            modalView.okText = "";
            modalView.closed = true;
            modalView.width = "550px";
            modalView.icon = (
                <Image
                    preview={false}
                    width={25}
                    src={settingInfoStore.DarkTheme() ? garbageLightIcon : garbageDarkIcon}
                />
            );
            const list = await DeleteList();
            modalView.content = (
                <DeleteView>
                    {list.map(item => {
                        return <div class={'item'}>
                            <span>{item?.fileName}</span>
                            <div class={'right'}>
                                <span class={'time'}>{`${item?.del} ${t("delete")}`}</span>
                                <UndoOutlined class={'recovery'} onClick={async () => {
                                    const res = await Recovery(item?.uuid!)
                                    if (res) {
                                        fileList.value.push(item!)
                                        DestroyModal()
                                        return
                                    }
                                    TipError(t('recoveryFailure'))
                                }}/>
                            </div>
                        </div>
                    })}
                </DeleteView>
            );
            // modalView.show();
            ShowModal(modalView);
        }

        const HelpView = styled.pre`
            padding: 10px;
            margin-right: 15px;
            max-height: 350px;
            overflow-y: auto;
            text-wrap: wrap;
            border-radius: 8px;
            background-color: ${() => settingInfoStore.DarkTheme() ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.4)'};
            box-shadow: 0 0 10px 5px ${() => settingInfoStore.DarkTheme() ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.5)'};
            color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.2)'};
            
            ::-webkit-scrollbar {
                display: none;
            }
        `

        const showHelp = async () => {
            const modalView = new ModalView();
            modalView.cancelText = "";
            modalView.okText = "";
            modalView.title = t("help");
            modalView.okText = "";
            modalView.closed = true;
            modalView.width = "650px";
            modalView.icon = (
                <QuestionOutlined
                    style={{color: settingInfoStore.DarkTheme() ? "white" : "black"}}
                />
            );
            const info = await HelpInfo(settingInfoStore.getState().lang);
            modalView.content = (
                <HelpView>
                    {info}
                </HelpView>
            );
            // modalView.show();
            ShowModal(modalView);
        }

        return () => (
            <Container>
                <ToolView>
                    <div class={"fileTitle"}>
                        <span class={"file"}>{fileName()}</span>
                    </div>
                    <div class={"title"}>
                        {!search.value && (
                            <PlusOutlined title={t('create')} class={"add"} onClick={createFile}/>
                        )}
                        {!search.value && (
                            <SearchOutlined
                                title={t('search')}
                                class={"add"}
                                onClick={() => (search.value = true)}
                            />
                        )}
                        <Transition name="expand" mode="out-in">
                            <Input
                                class={"search"}
                                placeholder={t("fileName")}
                                bordered={false}
                                suffix={
                                    <CloseOutlined
                                        style={{
                                            color: "gray",
                                        }}
                                        onClick={() => {
                                            search.value = false;
                                        }}
                                    />
                                }
                                onChange={(e) => {
                                    searchDoc(e.target.value!);
                                }}
                            ></Input>
                        </Transition>
                    </div>
                    <div
                        class={"tools"}
                        onDblclick={() => {
                            ScreenFullSwitch();
                        }}
                    >
                        <div class={"actions"}>
                            <div
                                class={"action"}
                                >
                                <PopoverView
                                    // open={showTag.value}
                                    content={
                                        <TagView>
                                            {tagColor.map((itm) => (
                                                <span
                                                    style={{
                                                        backgroundColor: itm,
                                                    }}
                                                    onClick={() => {
                                                        changeTag(itm);
                                                    }}
                                                ></span>
                                            ))}
                                        </TagView>
                                    }
                                >
                                    <TagOutlined/>
                                </PopoverView>
                            </div>
                            <div
                                class={"action"}
                                onClick={() => {
                                    showList.value = !showList.value;
                                }}
                            >
                                <LayoutOutlined/>
                            </div>
                            <div
                                class={"action"}
                                onClick={showHelp}
                                title={t('help')}
                            >
                                <QuestionOutlined/>
                            </div>
                            <Dropdown
                                class={"action"}
                                overlay={
                                    <Menu
                                        mode="inline"
                                        style={{
                                            backgroundColor: settingInfoStore.DarkTheme()
                                                ? "#2B2D31"
                                                : "#E9E9ED",
                                            // minWidth: '200px',
                                            display: 'flex',
                                            justifyContent: 'flex-start'
                                        }}
                                    >
                                        <MenuItemView title={t('export')} onClick={fileExport}>
                                            <ExportOutlined style={{fontSize: '17px'}}/>
                                        </MenuItemView>
                                        <MenuItemView title={t('delete')} onClick={deleteFile}>
                                            <DeleteOutlined style={{fontSize: '17px'}}/>
                                        </MenuItemView>
                                        <MenuItemView title={t('language')} onClick={changeLang}>
                                            <DribbbleOutlined style={{fontSize: '17px'}}/>
                                        </MenuItemView>
                                        <MenuItemView title={t('changeTheme')} onClick={SwitchTheme}>
                                            <BulbOutlined style={{fontSize: '17px'}}/>
                                        </MenuItemView>
                                        <MenuItemView title={t('configStore')} onClick={configStore}>
                                            <CloudUploadOutlined style={{fontSize: '17px'}}/>
                                        </MenuItemView>
                                        {/*<MenuItemView title={t('license')} onClick={showLicense}>*/}
                                        {/*    <SolutionOutlined style={{fontSize: '17px'}}/>*/}
                                        {/*</MenuItemView>*/}
                                    </Menu>
                                }
                            >
                                <MoreOutlined/>
                            </Dropdown>
                        </div>
                    </div>
                </ToolView>
                <BodyView>
                    <ListView>
                        <TransitionGroupCon name="fade" tag="div">
                            {fileList.value
                                .filter((item) => item.fileName !== "")
                                .map((item: RecordInfo) => {
                                    return (
                                        <div
                                            key={item.uuid}
                                            class={[
                                                "selectDefault",
                                                selectFileKey.value === item.uuid ? "select" : "",
                                            ]}
                                            onDblclick={async () => {
                                                selectFileKey.value = item.uuid;
                                                editFileKey.value = item.uuid;
                                                tempInfo.name = item.fileName;
                                                updateFileName();
                                            }}
                                            onClick={async () => {
                                                selectFileKey.value = item.uuid;
                                                updateFileName();
                                            }}
                                        >
                                            {editFileKey.value === item.uuid && (
                                                <Input
                                                    ref={(e) => (renameCom.value = e)}
                                                    key={item.uuid}
                                                    class={"editInput"}
                                                    bordered={false}
                                                    // style={{
                                                    //     // backgroundColor: settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.4)' : "white",
                                                    //     borderRadius: "0"
                                                    // }}
                                                    onPressEnter={okModify}
                                                    suffix={
                                                        <CheckOutlined
                                                            style={{
                                                                color: settingInfoStore.DarkTheme()
                                                                    ? "white"
                                                                    : "black",
                                                            }}
                                                            onClick={okModify}
                                                        />
                                                    }
                                                    onChange={(e) => (tempInfo.name = e.target.value!)}
                                                    value={tempInfo.name}
                                                ></Input>
                                            )}
                                            {editFileKey.value !== item.uuid && (
                                                <div class={"left"}>
                                                    <Image src={mdIcon} width={20} preview={false}/>
                                                    <span>{item.fileName}</span>
                                                </div>
                                            )}
                                            {editFileKey.value !== item.uuid && (
                                                <div class={"right"}>
                                                    <span>{item.sizeStr}</span>
                                                </div>
                                            )}
                                            {item.tag !== "" && (
                                                <div
                                                    class={"tag"}
                                                    style={{
                                                        backgroundColor: item.tag,
                                                    }}
                                                ></div>
                                            )}
                                        </div>
                                    );
                                })}
                        </TransitionGroupCon>
                        <span class={"footer"}>{`${fileList.value.length} ${t(
                            "file"
                        )}`}</span>
                        <GarbageView onClick={showDelFile}>
                            <Image src={settingInfoStore.DarkTheme() ? garbageLightIcon : garbageDarkIcon} width={18}
                                   preview={false}/>
                        </GarbageView>
                    </ListView>
                    <RouterViewCon>
                        <RouterView
                            v-slots={{
                                default: ({Component, route}: any) => (
                                    <Transition
                                        name={route.meta.transition || "fade"}
                                        mode="out-in"
                                    >
                                        <KeepAlive>
                                            <Component
                                                is={Component}
                                                key={route.path}
                                                ref={(el) => {
                                                    currentCom.value = el;
                                                }}
                                            ></Component>
                                        </KeepAlive>
                                    </Transition>
                                ),
                            }}
                        />
                    </RouterViewCon>
                </BodyView>
            </Container>
        );
    },
});
