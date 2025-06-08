import {FileContent, SyncFile,} from "@/bindings/changeme/handler/filehandler.js";
import {RecordInfo} from "@/bindings/changeme/model";
import Vditor from "vditor";
import {defineComponent, inject, onMounted, reactive, ref} from "vue";
import styled from "vue3-styled-components";
import {settingInfoStore} from "@/store/modules/settings.ts";
import {useI18n} from "vue-i18n";

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
            border: none;
            height: 100px;

            .vditor-toolbar {
                border: none;
            }
        `;

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
                    vditor.value?.setTheme(settingInfoStore.DarkTheme() ? 'dark' : 'classic', settingInfoStore.DarkTheme() ? 'dark' : 'classic');
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


        return () => (
            <Container>
                <EditorView
                    id="vditor"
                    ref={(el) => (vditorRef.value = el)}
                ></EditorView>
                <span class={'counter'}>{wordCounter.value}</span>
            </Container>
        );
    },
});
