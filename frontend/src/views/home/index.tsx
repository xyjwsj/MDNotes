import {defineComponent, inject, onBeforeMount, onMounted, reactive, ref} from 'vue';
import styled from "vue3-styled-components";
import Vditor from "vditor";
import {FileContent, SyncFile} from "@/bindings/changeme/handler/filehandler.ts";
import {RecordInfo} from "@/bindings/changeme/model";
import {DeleteOutlined} from "@ant-design/icons-vue";

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
                    color: gray;
                    font-size: 17px;
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
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

        const vditorRef = ref<any>(null)
        const vditor = ref<Vditor|null>(null)

        onMounted(() => {
            console.log('vditorRerf', vditorRef)
            initVditor("")
        })

        const initVditor = (defaultVal: string) => {
            vditor.value = new Vditor('vditor', {
                height: '805px',
                toolbar: [],
                placeholder: '请在这里输入内容',
                cache: {
                    enable: true,
                },
                after: () => {
                    vditorRef.value.setValue(defaultVal)
                },
                input: async (val: string) => {
                    const success = await SyncFile(editorInfo.fileKey, editorInfo.fileName, val)
                    console.log('SyncFile', editorInfo.fileName, success)
                },
                value: 'fdasfa',
                mode: 'wysiwyg',
                // 代码高亮
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

        onBeforeMount(() => {

        })

        const updateContent = async (info: RecordInfo) => {
            console.log(vditorRef.value)
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

        return () => (
            <Container>
                <div class={'tools'}>
                    <div class={'actions'} onClick={() => deleteFile(editorInfo.fileKey)}>
                        <DeleteOutlined/>
                    </div>
                    {editorInfo.create && <span class={'create'}>{`创建时间：${editorInfo.create}`}</span>}
                </div>
                <EditorView id="vditor" ref={el => vditorRef.value = el}></EditorView>
            </Container>
        )
    }
})