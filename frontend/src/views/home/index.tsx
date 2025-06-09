import {FileContent, SyncFile,} from "@/bindings/changeme/handler/filehandler.js";
import {RecordInfo} from "@/bindings/changeme/model";
import Vditor from "vditor";
import {defineComponent, inject, onMounted, reactive, ref} from "vue";
import styled from "vue3-styled-components";
import {settingInfoStore} from "@/store/modules/settings.ts";
import {useI18n} from "vue-i18n";
import {Image} from "ant-design-vue";
import {ModalView} from "@/util/modalUtil.tsx";
import wxpDarkIcon from '@/assets/png/wxp-black.png'
import wxpLightIcon from '@/assets/png/wxp-white.png'
import graphvizDarkIcon from '@/assets/png/graphviz-black.png'
import graphvizLightIcon from '@/assets/png/graphviz-white.png'
import gsDarkIcon from '@/assets/png/gs-black.png'
import gsLightIcon from '@/assets/png/gs-white.png'
import gttDarkIcon from '@/assets/png/gtt-black.png'
import gttLightIcon from '@/assets/png/gtt-white.png'
import lctDarkIcon from '@/assets/png/lct-black.png'
import lctLightIcon from '@/assets/png/lct-white.png'
import ntDarkIcon from '@/assets/png/nt-black.png'
import ntLightIcon from '@/assets/png/nt-white.png'
import sxtDarkIcon from '@/assets/png/sxt-black.png'
import sxtLightIcon from '@/assets/png/sxt-white.png'

export default defineComponent({
    name: "Home",
    setup(_, {expose}) {

        const {t} = useI18n();

        const Container = styled.div`
            margin: 0 auto;
            height: 100%;
            width: 100%;
            border: none;
            position: relative;
            
            .counter {
                position: absolute;
                top: 0;
                right: 0;
                height: 15px;
                width: 30px;
                background-color: ${() => settingInfoStore.DarkTheme() ? '#2B2D30' : '#E0E0E3'};
                color: gray;
                text-align: center;
                font-size: 12px;
            }
        `;

        const EditorView = styled.div`
            border: none !important;
            height: 100px;

            .vditor-toolbar {
                border: none;
            }
        `;

        const TemplateView = styled.div`
            max-height: 450px;
            overflow-y: auto;
            border-radius: 8px;
            padding: 20px 5px;

            ::-webkit-scrollbar {
                display: none;
            }
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 40px;
            justify-content: space-around;
            .item {
                color: ${() => settingInfoStore.DarkTheme() ? 'white' : 'black'};
                //width: 120px;
                height: 120px;
                width: 40%;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
            }
        `

        const templateInfo = reactive([
            {
                name: '五线谱',
                lightIcon: wxpLightIcon,
                darkIcon: wxpDarkIcon,
            },
            {
                name: '数学公式',
                lightIcon: gsLightIcon,
                darkIcon: gsDarkIcon,
            },
            {
                name: '脑图',
                lightIcon: ntLightIcon,
                darkIcon: ntDarkIcon,
            },
            {
                name: '流程图',
                lightIcon: lctLightIcon,
                darkIcon: lctDarkIcon,
            },
            {
                name: '时序图',
                lightIcon: sxtLightIcon,
                darkIcon: sxtDarkIcon,
            },
            {
                name: '甘特图',
                lightIcon: gttLightIcon,
                darkIcon: gttDarkIcon,
            },
            {
                name: 'Graphviz',
                lightIcon: graphvizLightIcon,
                darkIcon: graphvizDarkIcon,
            }
        ])

        const editorInfo = reactive({
            fileKey: "",
            fileName: "",
            create: "",
        });

        const updateFileSize: any = inject("updateFileSize");

        const wordCounter = ref(0)
        const vditorRef = ref<any>(null);
        const vditor = ref<Vditor | null>(null);

        onMounted(() => {
            console.log("vditorRerf", vditorRef);
            initVditor("");
        });

        const initVditor = (defaultVal: string) => {
            vditor.value = new Vditor("vditor", {
                theme: settingInfoStore.DarkTheme() ? 'dark' : 'classic',
                // theme: 'dark',
                height: "810px",
                toolbar: [],
                toolbarConfig: {
                    hide: false,
                },
                placeholder: t('editorPlaceholder'),
                cache: {
                    enable: true,
                },
                after: () => {
                    vditor.value?.setTheme(settingInfoStore.DarkTheme() ? 'dark' : 'classic', settingInfoStore.DarkTheme() ? 'dark' : 'github');
                },
                input: async (val: string) => {
                    const success = await SyncFile(editorInfo.fileKey, val);
                    if (success !== "") {
                        updateFileSize(editorInfo.fileKey, success);
                    }
                    wordCounter.value = val.length
                    console.log("SyncFile", editorInfo.fileName, success);
                },
                upload: {
                    accept: "image/*",
                    url: "/api/upload",
                    linkToImgUrl: "/api/upload",
                    format: (files: File[], responseText: string) => {
                        const data = {
                            msg: "",
                            code: 0,
                            data: {
                                errFiles: [],
                                succMap: {},
                            },
                        };
                        (data.data.succMap as any)[files[0].name] = responseText;

                        console.log("%%%%%%%%", responseText, data);
                        return JSON.stringify(data);
                    },
                    linkToImgCallback: (responseText: string) => {
                        console.log("%%%%%%%%", responseText);
                    },
                    linkToImgFormat: (responseText: string) => {
                        console.log("########", responseText);
                        return "";
                    },
                },
                value: defaultVal,
                // 代码高亮
                mode: "ir",
                preview: {
                    delay: 0,
                    hljs: {
                        style: "monokai",
                        lineNumber: true,
                    },
                },
            });
            console.log("vditor init success...");
        };

        onMounted(async () => {

        });

        const updateTheme = () => {
            vditor.value?.setTheme(settingInfoStore.DarkTheme() ? 'dark' : 'classic', settingInfoStore.DarkTheme() ? 'dark' : 'classic', settingInfoStore.DarkTheme() ? 'dark' : 'github');
        }

        const updateContent = async (info: RecordInfo) => {
            if (editorInfo.fileKey !== info.uuid) {
                const content = await FileContent(info.uuid);
                console.log("ref", vditorRef);
                vditor.value!.setValue(content, true);
                wordCounter.value = content.length
            }
            editorInfo.fileName = info.fileName;
            editorInfo.create = info.create;
            editorInfo.fileKey = info.uuid;
        };

        expose({updateContent, updateTheme});
        // expose({updateTheme})

        const command = ref(false)
        const action = ref(false)

        const showMDTemplate = () => {
            if (!command.value || !action.value) {
                return
            }
            command.value = false
            action.value = false
            const modalView =  new ModalView()
            modalView.title = "选择插入模版"
            modalView.okText = ""
            modalView.cancelText = ""
            modalView.closed = true
            modalView.width = "60%"
            modalView.content = <TemplateView>
                {templateInfo.map(item => {
                    return <div class={'item'} onDblclick={() => {
                        modalView.destroy()
                    }}>
                        <Image style={{
                            height: '100px'
                        }} src={settingInfoStore.DarkTheme()? item.darkIcon: item.lightIcon} preview={false}></Image>
                        <span>{item.name}</span>
                    </div>
                })}
            </TemplateView>
            modalView.show()
        }

        return () => (
            <Container>
                <EditorView
                    id="vditor"
                    ref={(el) => (vditorRef.value = el)}
                    onKeydown={(event) => {
                        if (event.keyCode === 91) {
                            command.value = true
                        }
                        if (event.keyCode === 73) {
                            action.value = true
                        }
                        showMDTemplate()
                    }}
                ></EditorView>
                <span class={'counter'}>{wordCounter.value}</span>
            </Container>
        );
    },
});
