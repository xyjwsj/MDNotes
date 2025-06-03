import {defineComponent, inject, onMounted, reactive, ref} from 'vue';
import styled from "vue3-styled-components";
import Vditor from "vditor";
import {FileContent, SyncFile} from "@/bindings/changeme/handler/filehandler.ts";
import {RecordInfo} from "@/bindings/changeme/model";
import {DeleteOutlined, ExportOutlined, SettingOutlined} from "@ant-design/icons-vue";
import moment from "moment";
import {SameDay} from "@/util/dateUtil.ts";
import {Button, Input, Modal} from "ant-design-vue";
import {TipSuccess, TipWarning} from "@/util/messageUtil.ts";
import {ConfigStore, PreferenceInfo} from "@/bindings/changeme/handler/systemhandler.ts";

export default defineComponent({
    name: 'Home',
    setup(_, {expose}) {

        const Container = styled.div`
            margin: 0 auto;
            height: 100%;
            width: 100%;
            border: none;

            .tools {
                background-color: rgba(239, 239, 242, 0.6);
                height: 45px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0 20px;

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
                    gap: 15px;

                    .action {
                        height: 45px;
                        color: lightgray;
                        font-size: 17px;
                        display: flex;
                        justify-content: flex-end;
                        align-items: center;

                        &:hover {
                            color: gray;
                        }
                    }
                }
            }

            .settingDialog {
                background: transparent;
                //内容

                :global(.ant-modal-content) {
                    background-color: rgba(0, 0, 0, 0.1) !important;
                    border-radius: 5px !important;
                    //width: 350px !important;

                    .ant-modal-header {
                        //background: transparent !important;
                        border-radius: 0 !important;
                    }

                    :global(.ant-modal-title) {
                        color: gray !important;
                        background-color: rgba(0, 0, 0, 0.1) !important;
                    }
                }

            }
        `
        const ActionBtn = styled.div`
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: flex-end;
            align-items: center;
            gap: 10px;

            .btn {
                background-color: lightgray;
                border: none;
                color: gray;

                &:hover {
                    background-color: gray;
                }
            }
        `

        const EditorView = styled.div`
            border: none;
            height: 100px;


            .vditor-toolbar {
                border: none;
            }
        `

        const editorInfo = reactive({
            fileKey: '',
            fileName: '',
            create: '',
        })

        const deleteFile: any = inject('deleteFile')
        const exportFile: any = inject('exportFile')
        const updateFileSize: any = inject('updateFileSize')

        const vditorRef = ref<any>(null)
        const vditor = ref<Vditor | null>(null)

        onMounted(() => {
            console.log('vditorRerf', vditorRef)
            initVditor("")
        })

        const openSettings = ref(false)

        const settingInfo = reactive({
            url: '',
            username: '',
            token: ''
        })

        const configStore = async () => {
            if (settingInfo.url === '') {
                TipWarning('远程URL地址未配置')
                return
            }
            if (settingInfo.username === '') {
                TipWarning('远程用户名未配置')
                return
            }
            if (settingInfo.token === '') {
                TipWarning('远程TOKEN未配置')
                return
            }
            const res = await ConfigStore(settingInfo.url, settingInfo.username, settingInfo.token);
            if (res) {
                TipSuccess("配置成功")
            } else {
                TipSuccess("配置失败")
            }

        }


        const settings = () => {
            openSettings.value = !openSettings.value
        }

        const initVditor = (defaultVal: string) => {
            vditor.value = new Vditor('vditor', {
                height: '805px',
                toolbar: [],
                toolbarConfig: {
                    hide: false
                },
                placeholder: '请在这里输入内容',
                cache: {
                    enable: true,
                },
                after: () => {
                    // vditorRef.value.setValue(defaultVal)
                    vditor.value?.setTheme('classic')
                },
                input: async (val: string) => {
                    const success = await SyncFile(editorInfo.fileKey, val)
                    if (success !== "") {
                        updateFileSize(editorInfo.fileKey, success)
                    }
                    console.log('SyncFile', editorInfo.fileName, success)
                },
                upload: {
                    accept: 'image/*',
                    url: '/api/upload',
                    linkToImgUrl: '/api/upload',
                    format: (files: File[], responseText: string) => {
                        const data = {
                            "msg": "",
                            "code": 0,
                            "data": {
                                "errFiles": [],
                                "succMap": {}
                            }
                        };
                        (data.data.succMap as any)[files[0].name] = responseText

                        console.log('%%%%%%%%', responseText, data)
                        return JSON.stringify(data)
                    },
                    linkToImgCallback: (responseText: string) => {
                        console.log('%%%%%%%%', responseText)
                    },
                    linkToImgFormat: (responseText: string) => {
                        console.log('########', responseText)
                        return ""
                    }
                },
                value: defaultVal,
                // 代码高亮
                mode: 'ir',
                preview: {
                    delay: 0,
                    hljs: {
                        style: 'monokai',
                        lineNumber: true
                    }
                }
            })
            console.log('vditor init success...')

        }

        onMounted(async () => {
            const info = await PreferenceInfo()
            settingInfo.username = info.username
            settingInfo.url = info.remoteUrl
            settingInfo.token = info.token
        })

        const updateContent = async (info: RecordInfo) => {
            console.log(info)
            if (editorInfo.fileKey !== info.uuid) {
                const content = await FileContent(info.uuid);
                console.log('ref', vditorRef)
                vditor.value!.setValue(content, true)
            }
            editorInfo.fileName = info.fileName
            editorInfo.create = info.create
            editorInfo.fileKey = info.uuid
        }

        expose({updateContent})

        const formatDate = (str: string) => {
            const dateStr = str.split(" ");
            const dateObj = moment(str);
            const now = moment();
            let formatStr = str
            if (SameDay(now.toDate(), dateObj.toDate())) {
                formatStr = "今天 " + dateStr[1]
            }
            let res = dateObj.add(1, 'days');
            if (SameDay(now.toDate(), res.toDate())) {
                formatStr = "昨天 " + dateStr[1]
            }
            res = dateObj.add(2, 'days');
            if (SameDay(now.toDate(), res.toDate())) {
                formatStr = "前天 " + dateStr[1]
            }
            return formatStr
        }

        return () => (
            <Container>
                <div class={'tools'}>
                    {editorInfo.create && <span class={'create'}>{`${formatDate(editorInfo.create)}创建`}</span>}
                    <div class={'actions'}>
                        <div class={'action'} onClick={() => deleteFile(editorInfo.fileKey)}>
                            <DeleteOutlined/>
                        </div>
                        <div class={'action'} onClick={() => exportFile(editorInfo.fileKey)}>
                            <ExportOutlined/>
                        </div>
                        <div class={'action'} onClick={() => settings()}>
                            <SettingOutlined/>
                        </div>
                    </div>
                </div>
                <Modal
                    class={'settingDialog'}
                    width={350}
                    bodyStyle={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        gap: '10px',
                        width: '100%'
                    }}
                    title={'配置远程存储'}
                    centered
                    closable={false}
                    footer={null}
                    mask={false}
                    open={openSettings.value}>
                    <Input
                        bordered={false}
                        placeholder={'请输入远程存储地址(gitee)'}
                        defaultValue={settingInfo.url}
                        onChange={e => settingInfo.url = e.target.value!}></Input>
                    <Input
                        bordered={false}
                        placeholder={'请输入用户名'}
                        defaultValue={settingInfo.username}
                        onChange={e => settingInfo.username = e.target.value!}></Input>
                    <Input
                        bordered={false}
                        placeholder={'请输入Token'}
                        defaultValue={settingInfo.token}
                        onChange={e => settingInfo.token = e.target.value!}></Input>
                    <ActionBtn>
                        <Button class={'btn'} onClick={() => {
                            openSettings.value = !openSettings.value
                        }}>{'取消'}</Button>
                        <Button class={'btn'} onClick={() => {
                            openSettings.value = !openSettings.value
                            configStore()
                        }}>{'确认'}</Button>
                    </ActionBtn>
                </Modal>
                <EditorView id="vditor" ref={el => vditorRef.value = el}></EditorView>
            </Container>
        )
    }
})