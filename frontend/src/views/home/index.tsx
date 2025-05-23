import {defineComponent, onBeforeMount, onMounted, ref} from 'vue';
import styled from "vue3-styled-components";
import Vditor from "vditor";

export default defineComponent({
    name: 'Home',
    setup() {

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
                        // vditorRef.value.setValue("## 所见即所得（WYSIWYG）\\n所见即所得模式对不熟悉 Markdown 的用户较为友好，熟悉 Markdown 的话也可以无缝使用。 ")
                    },
                    input: (val: string) => {
                        console.log('xxxxx', val)
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

        return () => (
            <Container id="vditor" ref={vditorRef} onClick={() => alert('kkk')}>
            </Container>
        )
    }
})