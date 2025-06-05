import mdIcon from "@/assets/png/markdown.png";
import {
    CreateFile,
    DeleteFile,
    DocList,
    ExportFile,
    ModifyName,
    Search,
} from "@/bindings/changeme/handler/filehandler.ts";
import {RecordInfo} from "@/bindings/changeme/model";
import {TipSuccess, TipWarning} from "@/util/messageUtil.ts";
import {
    CheckOutlined,
    DeleteOutlined,
    ExportOutlined,
    PlusOutlined,
    RightOutlined,
    SearchOutlined,
} from "@ant-design/icons-vue";
import {Image, Input} from "ant-design-vue";
import {defineComponent, KeepAlive, onMounted, provide, reactive, ref, Transition,} from "vue";
import {RouterView} from "vue-router";
import styled from "vue3-styled-components";
import {ModalView} from "@/util/modalUtil.tsx";
import {ConfigStore, PreferenceInfo} from "@/bindings/changeme/handler/systemhandler.ts";
import {settingInfoStore} from "@/store/modules/settings.ts";

export default defineComponent({
    name: "Layout",
    setup() {
        const Container = styled.div`
            margin: 0 auto;
            width: 100%;
            height: 100%;
            display: flex;
        `;

        const MenuView = styled.div`
            width: 280px;
            background-color: ${() => settingInfoStore.DarkTheme() ? '#2b2d30' : '#efeff2'};
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;

            .title {
                width: calc(100% - 100px);
                margin-left: 80px;
                height: 45px;
                text-align: right;
                padding-right: 20px;
                line-height: 45px;
                font-weight: 600;
                display: flex;
                font-size: 19px;
                justify-content: flex-end;

                .name {
                    font-size: 14px;
                    margin-right: 20px;
                    color: ${() => settingInfoStore.DarkTheme() ? 'white' : 'gray'};
                }

                .add {
                    line-height: 45px;
                    color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.4)' : 'lightgray'};

                    &:hover {
                        color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.8)' : 'gray'};;
                    }
                }
            }

            .search {
                background-color: ${() => settingInfoStore.DarkTheme() ? 'rgba(0, 0, 0, 0.1)' : '#fafafa'};
                padding-left: 10px;
                border-radius: 0;
                font-size: 12px;
                display: flex;
                align-items: center;

                .ant-input {
                    padding-left: 10px;
                    color: ${() => settingInfoStore.DarkTheme() ?  'white' : 'rgba(0, 0, 0, 0.6)'};;

                    &::placeholder {
                        color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.4)'};
                    }
                }
            }

            .footer {
                height: 20px;
                font-size: 11px;
                color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.4)' : 'gray'};
                position: absolute;
                bottom: 0;
            }

            .editInput {
                .ant-input {
                    color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.9)' : 'black'};
                }
            }
            
            .selectDefault {
                line-height: 30px;
                width: calc(100% - 40px);
                padding: 0 20px;
                font-size: 14px;
                display: flex;
                color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.6)' : 'rgba(48, 48, 45, 1)'};
                justify-content: space-between;

                &:hover {
                    background-color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e3'};
                }

                .left {
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    gap: 5px;
                }

                .right {
                    font-size: 12px;
                    color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.4)' : 'gray'};
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    gap: 3px;
                }
            }

            .select {
                background-color: ${() => settingInfoStore.DarkTheme() ? '#43454A' : '#e7e7ea'};
            }
        `;

        const RouterViewCon = styled.div`
            min-height: 500px; /* 固定最小高度，防抖动 */
            overflow-y: auto;
            width: calc(100% - 50px);

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

        const InputView = styled(Input)`
            background-color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.6)'};
            margin: 5px 0;
            color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.8)' : 'gray'};

            .ant-input {
                &::placeholder {
                    color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.4)' : 'gray'};
                }
            }
            
            &:hover {
                background-color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.4)' : '#fafafa'};
            }

            &:focus {
                background-color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.4)' : 'white'};;
            }
        `;


        const fileList = ref<RecordInfo[]>([]);

        const selectFileKey = ref("");
        const editFileKey = ref("");
        const tempInfo = reactive({
            name: "",
        });

        const currentCom = ref(null);

        const updateFileName = () => {
            const res = fileList.value.filter(
                (item) => item.uuid === selectFileKey.value
            );
            if (res.length == 0) {
                return;
            }
            if (currentCom.value) {
                (currentCom.value as any).updateContent(res[0]);
            }
        };

        onMounted(async () => {
            const docs = await DocList();
            fileList.value.splice(0, fileList.value.length);
            docs.forEach((item) => {
                if (item !== null) {
                    fileList.value.push(item);
                }
            });
        });

        const deleteFile = (key: string) => {
            if (key === "") {
                TipWarning('请选择文件')
                return
            }
            const modalView = new ModalView()
            const files = fileList.value.filter((item) => item.uuid === key);
            if (files.length > 0) {
                modalView.content = <span style={{color: settingInfoStore.DarkTheme() ? 'white' : 'black'}}>{`确认删除'${files[0].fileName}'文件？`}</span>;
            }
            modalView.icon = <DeleteOutlined style={{color: settingInfoStore.DarkTheme() ? 'white' : 'black'}}/>
            modalView.ok = async () => {
                const res = await DeleteFile(key);
                if (!res) {
                    TipWarning("删除失败!");
                    return;
                }
                // 再从本地列表中过滤掉该条目
                const index = fileList.value.findIndex((item) => item.uuid === key);
                if (index !== -1) {
                    fileList.value.splice(index, 1);
                }

                // 如果当前选中的是被删除的文件，则清空编辑器
                if (selectFileKey.value === key) {
                    selectFileKey.value = "";
                    if (currentCom.value) {
                        // 可以选择触发一个 clear 或 reset 方法
                    }
                }
            }
            modalView.show()
        };

        const exportFile = (key: string) => {
            const modalView = new ModalView()
            modalView.cancelText = '导出所有'
            modalView.okText = '导出当前'
            modalView.title = "导出"
            modalView.closed = true
            modalView.icon = <ExportOutlined style={{color: settingInfoStore.DarkTheme() ? 'white' : 'black'}}/>
            modalView.content = <span style={{color: settingInfoStore.DarkTheme() ? 'white' : 'black'}}>{`请选择导出方式`}</span>;
            modalView.ok = async () => {
                if (key === "") {
                    TipWarning('请选择文件')
                    return
                }
                if (await ExportFile(false, key)) {
                    TipSuccess("当前文件导出成功")
                } else {
                    TipSuccess("当前文件导出失败")
                }
            }
            modalView.cancel = async () => {
                if (await ExportFile(true, key)) {
                    TipSuccess("所有文件导出成功")
                } else {
                    TipSuccess("所有文件导出失败")
                }
            }
            modalView.show()
        };

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

            const modalView = new ModalView()
            modalView.width = 400
            modalView.title = '配置远程存储'
            modalView.content = <div>
                <InputView
                    class={"inputC"}
                    bordered={false}
                    placeholder={"请输入远程存储地址(gitee)"}
                    defaultValue={settingInfo.url}
                    onChange={(e) => (settingInfo.url = e.target.value!)}
                ></InputView>
                <InputView
                    class={"inputC"}
                    bordered={false}
                    placeholder={"请输入用户名"}
                    defaultValue={settingInfo.username}
                    onChange={(e) => (settingInfo.username = e.target.value!)}
                ></InputView>
                <InputView
                    class={"inputC"}
                    bordered={false}
                    placeholder={"请输入Token"}
                    defaultValue={settingInfo.token}
                    onChange={(e) => (settingInfo.token = e.target.value!)}
                ></InputView>
            </div>
            modalView.ok = async () => {
                if (settingInfo.url === "") {
                    TipWarning("远程URL地址未配置");
                    return;
                }
                if (settingInfo.username === "") {
                    TipWarning("远程用户名未配置");
                    return;
                }
                if (settingInfo.token === "") {
                    TipWarning("远程TOKEN未配置");
                    return;
                }
                const res = await ConfigStore(
                    settingInfo.url,
                    settingInfo.username,
                    settingInfo.token
                );
                if (res) {
                    TipSuccess("配置成功");
                } else {
                    TipSuccess("配置失败");
                }
            }

            modalView.show()
        };

        provide("deleteFile", deleteFile);
        provide("exportFile", exportFile);
        provide("updateFileSize", updateFileSize);
        provide("configStore", configStore);

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
            const searchList = await Search(name)
            fileList.value.splice(0, fileList.value.length);
            searchList.forEach((item) => {
                if (item !== null) {
                    fileList.value.push(item);
                }
            });
        }

        return () => (
            <Container>
                <MenuView>
                    <div class={"title"}>
                        <PlusOutlined
                            class={"add"}
                            onClick={async () => {
                                const file = await CreateFile();
                                fileList.value.push(file);
                                selectFileKey.value = file.uuid;
                                updateFileName();
                            }}
                        />
                    </div>
                    <Input
                        class={"search"}
                        placeholder={"文件名"}
                        prefix={
                            <SearchOutlined
                                style={{
                                    color: "gray",
                                }}
                            />
                        }
                        bordered={false}
                        onChange={e => {
                            searchDoc(e.target.value!)
                        }}
                    ></Input>
                    {fileList.value
                        .filter((item) => item.fileName !== "")
                        .map((item: RecordInfo) => {
                            return editFileKey.value === item.uuid ? (
                                <Input
                                    class={'editInput'}
                                    bordered={false}
                                    style={{
                                        backgroundColor: settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.4)' : "white",
                                        borderRadius: "0"
                                    }}
                                    onPressEnter={okModify}
                                    suffix={<CheckOutlined onClick={okModify}/>}
                                    onChange={(e) => (tempInfo.name = e.target.value!)}
                                    value={tempInfo.name}
                                ></Input>
                            ) : (
                                <div
                                    class={[
                                        "selectDefault",
                                        selectFileKey.value === item.uuid ? "select" : "",
                                    ]}
                                    onDblclick={() => {
                                        selectFileKey.value = item.uuid;
                                        editFileKey.value = item.uuid;
                                        tempInfo.name = item.fileName;
                                        updateFileName();
                                    }}
                                    onClick={() => {
                                        selectFileKey.value = item.uuid;
                                        updateFileName();
                                    }}
                                >
                                    <div class={"left"}>
                                        <Image src={mdIcon} width={20} preview={false}/>
                                        <span>{item.fileName}</span>
                                    </div>
                                    <div class={"right"}>
                                        <span>{item.sizeStr}</span>
                                        <RightOutlined/>
                                    </div>
                                </div>
                            );
                        })}
                    <span class={"footer"}>{`${fileList.value.length}个文件`}</span>
                </MenuView>
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
                                            ref={currentCom}
                                        ></Component>
                                    </KeepAlive>
                                </Transition>
                            ),
                        }}
                    />
                </RouterViewCon>
            </Container>
        );
    },
});
