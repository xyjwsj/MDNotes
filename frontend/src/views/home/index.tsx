import {defineComponent, onBeforeMount, onMounted, reactive, ref} from 'vue';
import styled from "vue3-styled-components";
import Vditor from "vditor";
import {FileContent, SyncFile} from "@/bindings/changeme/handler/filehandler.ts";

export default defineComponent({
    name: 'Home',
    setup(_, { expose }) {

        const Container = styled.div`
            margin: 0 auto;
            height: 100%;
            width: 100%;
            border: none;
            padding: 20px 10px 10px 0;
            
            .vditor-toolbar {
                border: none;
            }
        `

        const editorInfo = reactive({
            fileKey: '',
            fileName: '',
        })

        const vditorRef = ref<any>(null)

        onMounted(() => {
            console.log('vditorRerf', vditorRef)
            if (vditorRef.value) {
                vditorRef.value = new Vditor('vditor', {
                    height: '100%',
                    toolbar: [],
                    placeholder: '请在这里输入内容',
                    cache: {
                        enable: false,
                    },
                    after: () => {

                    },
                    input: async (val: string) => {
                        const success = await SyncFile(editorInfo.fileKey, editorInfo.fileName, val)
                        console.log('SyncFile', editorInfo.fileName, success)
                    },
                    value: '',
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
        })

        onBeforeMount(() => {

        })

        const updateContent = async (key: string, fileName: string) => {
            if (editorInfo.fileKey !== key) {
                const content = await FileContent(key)
                vditorRef.value.setValue(content)
            }
            editorInfo.fileKey = key
            editorInfo.fileName = fileName
        }

        expose({updateContent})

        return () => (
            <Container id="vditor" ref={vditorRef} onClick={() => alert('kkk')}>
            </Container>
        )
    }
})