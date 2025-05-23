import {defineComponent, onMounted, reactive, ref, Transition} from 'vue';
import styled from "vue3-styled-components";
import {RouterView} from "vue-router";
import {CheckOutlined, PlusOutlined} from "@ant-design/icons-vue";
import {Input} from "ant-design-vue";
import {CreatFileKey, DocList} from "@/bindings/changeme/handler/filehandler.ts";
import {RecordInfo} from "@/bindings/changeme/model";

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
            background-color: #EFEFF2;
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
                width: calc(100% - 20px);
                padding-left: 20px;
                font-size: 14px;
                &:hover {
                    background-color: #E0E0E3;
                }
            }

            .select {
                background-color: #E7E7EA;
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
        const fileList = ref<RecordInfo[]>([])

        const selectFileKey = ref('')
        const editFileKey = ref('')
        const tempInfo = reactive({
            name: ''
        })

        const currentCom = ref(null)

        const updateFileName = () => {
            const res = fileList.value.filter(item => item.uuid === selectFileKey.value)
            if (res.length == 0) {
                return
            }
            if (currentCom.value) {
                (currentCom.value as any).updateContent(res[0].uuid, res[0].fileName)
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
                        <PlusOutlined style={{lineHeight: '45px', color: "gray"}} onClick={async () => {
                            const fileKey = await CreatFileKey()
                            fileList.value.push({
                                fileName: 'New',
                                uuid: fileKey,
                                create: null,
                                modify: null,
                            })
                            selectFileKey.value = fileKey
                            updateFileName()
                        }}/>
                    </div>
                    {fileList.value.filter(item => item.fileName !== "").map((item: RecordInfo) => {
                        return editFileKey.value === item.uuid ?
                            <Input bordered={false} style={{backgroundColor: 'white', borderRadius: '0'}} suffix={
                                <CheckOutlined onClick={() => {
                                    fileList.value.forEach(item => {
                                        if (item.uuid === editFileKey.value) {
                                            item.fileName = tempInfo.name
                                        }
                                    })
                                    tempInfo.name = ''
                                    editFileKey.value = ''
                                    updateFileName()
                                }}/>
                            }
                                   onChange={e => tempInfo.name = e.target.value!}
                                   value={tempInfo.name}></Input> :
                            <span class={['selectDefault', selectFileKey.value === item.uuid ? "select" : ""]}
                                  onDblclick={() => {
                                      selectFileKey.value = item.uuid
                                      editFileKey.value = item.uuid
                                      tempInfo.name = item.fileName
                                      updateFileName()
                                  }} onClick={() => {
                                selectFileKey.value = item.uuid
                                updateFileName()
                            }}>{item.fileName}</span>
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