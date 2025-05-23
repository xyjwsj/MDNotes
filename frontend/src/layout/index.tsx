import {defineComponent, onMounted, reactive, ref, Transition} from 'vue';
import styled from "vue3-styled-components";
import {RouterView} from "vue-router";
import {CheckOutlined, PlusOutlined} from "@ant-design/icons-vue";
import {Input} from "ant-design-vue";
import {DocList} from "@/bindings/changeme/handler/filehandler.ts";

export default defineComponent({
    name: 'Layout',
    setup() {

        const Container = styled.div`
            margin: 0 auto;
            width: 100%;
            height: 100%;
            display: flex;

        `

        const MenuView = styled.div`
            width: 280px;
            background-color: rgba(128, 128, 128, 0.1);
            height: 100%;
            display: flex;
            flex-direction: column;

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
                justify-content: space-between;

                .name {
                    font-size: 14px;
                    margin-right: 20px;
                    color: gray;
                }
            }

            .selectDefault {
                line-height: 30px;
                width: 100%;
                padding-left: 20px;
            }

            .select {
                background-color: rgba(128, 128, 128, 0.2);
            }
        `

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
        `
        const fileList = ref<string[]>([])

        const selectFileIdx = ref(0)
        const editFileIdx = ref(-1)
        const tempInfo = reactive({
            name: ''
        })

        const currentCom = ref(null)

        const updateFileName = () => {
            const name = fileList.value[selectFileIdx.value]
            if (currentCom.value) {
                (currentCom.value as any).updateContent(name)
            }
        }

        onMounted(async () => {
            const docs = await DocList()
            fileList.value.splice(0, fileList.value.length)
            docs.forEach(item => fileList.value.push(item))
        })

        return () => (
            <Container>
                <MenuView>
                    <div class={'title'}>
                        <span class={'name'}>MDNotes</span>
                        <PlusOutlined style={{lineHeight: '45px', color: "gray"}} onClick={() => {
                            fileList.value.push("New")
                            updateFileName()
                        }}/>
                    </div>
                    {fileList.value.filter(item => item !== "").map((item: string, index: number) => {
                        return editFileIdx.value === index ?
                            <Input bordered={false} style={{backgroundColor: 'white', borderRadius: '0'}} suffix={
                                <CheckOutlined onClick={() => {
                                    fileList.value[editFileIdx.value] = tempInfo.name
                                    tempInfo.name = ''
                                    editFileIdx.value = -1
                                    updateFileName()
                                }}/>
                            }
                                   onChange={e => tempInfo.name = e.target.value!}
                                   value={tempInfo.name}></Input> :
                            <span class={['selectDefault', selectFileIdx.value === index ? "select" : ""]}
                                  onDblclick={() => {
                                      editFileIdx.value = index
                                      tempInfo.name = fileList.value[editFileIdx.value]
                                      updateFileName()
                                  }} onClick={() => {
                                selectFileIdx.value = index
                                updateFileName()
                            }}>{item}</span>
                    })}
                </MenuView>
                <RouterViewCon>
                    <RouterView
                        v-slots={{
                            default: ({Component, route}: any) => (
                                <Transition name={route.meta.transition || 'fade'} mode='out-in'>
                                    <Component is={Component} key={route.path} ref={currentCom}></Component>
                                </Transition>
                            )
                        }}
                    />
                </RouterViewCon>
            </Container>
        )
    }
})