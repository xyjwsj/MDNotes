import {defineComponent, KeepAlive, onMounted, provide, reactive, ref, Transition} from 'vue';
import styled from "vue3-styled-components";
import {RouterView} from "vue-router";
import {CheckOutlined, PlusOutlined, SearchOutlined} from "@ant-design/icons-vue";
import {Input, Modal} from "ant-design-vue";
import {CreateFile, DeleteFile, DocList} from "@/bindings/changeme/handler/filehandler.ts";
import {RecordInfo} from "@/bindings/changeme/model";
import {TipWarning} from "@/util/messageUtil.ts";

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
                    color: gray;
                }

                .add {
                    line-height: 45px;
                    color: lightgray;

                    &:hover {
                        color: gray;
                    }
                }
            }

            .search {
                background-color: #FAFAFA;
                border-radius: 0;
                font-size: 12px;
            }

            .footer {
                height: 20px;
                font-size: 11px;
                color: gray;
                position: absolute;
                bottom: 0;
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
                (currentCom.value as any).updateContent(res[0])
            }
        }

        onMounted(async () => {
            const docs = await DocList()
            fileList.value.splice(0, fileList.value.length)
            docs.forEach(item => fileList.value.push(item))
        })

        const deleteFile = (key: string) => {
            Modal.confirm({
                width: 300,
                title: '删除',
                centered: true,
                content: () => {
                    const files = fileList.value.filter(item => item.uuid === key)
                    if (files.length > 0) {
                        return <span>{`确认删除'${files[0].fileName}'文件？`}</span>
                    }
                },
                onOk: async () => {
                    const res = await DeleteFile(key)
                    if (!res) {
                        TipWarning('删除失败!')
                        return
                    }
                    // 再从本地列表中过滤掉该条目
                    const index = fileList.value.findIndex(item => item.uuid === key);
                    if (index !== -1) {
                        fileList.value.splice(index, 1);
                    }

                    // 如果当前选中的是被删除的文件，则清空编辑器
                    if (selectFileKey.value === key) {
                        selectFileKey.value = '';
                        if (currentCom.value) {
                            // 可以选择触发一个 clear 或 reset 方法
                        }
                    }
                }
            })

        }
        provide('deleteFile', deleteFile)

        const okModify = () => {
            fileList.value.forEach(item => {
                if (item.uuid === editFileKey.value) {
                    item.fileName = tempInfo.name
                }
            })
            tempInfo.name = ''
            editFileKey.value = ''
            updateFileName()
        };

        return () => (
            <Container>
                <MenuView>
                    <div class={'title'}>
                        <PlusOutlined class={'add'} onClick={async () => {
                            const file = await CreateFile()
                            fileList.value.push(file)
                            selectFileKey.value = file.uuid
                            updateFileName()
                        }}/>
                    </div>
                    <Input class={'search'}
                           placeholder={"文件名"}
                           prefix={<SearchOutlined style={{
                               color: 'gray',
                           }}/>}
                           bordered={false}></Input>
                    {fileList.value.filter(item => item.fileName !== "").map((item: RecordInfo) => {

                        return editFileKey.value === item.uuid ?
                            <Input bordered={false}
                                   style={{backgroundColor: 'white', borderRadius: '0'}}
                                   onPressEnter={okModify}
                                   suffix={
                                       <CheckOutlined onClick={okModify}/>
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
                    <span class={'footer'}>{`${fileList.value.length}个文件`}</span>
                </MenuView>
                <RouterViewCon>
                    <RouterView
                        v-slots={{
                            default: ({Component, route}: any) => (
                                <Transition name={route.meta.transition || 'fade'} mode='out-in'>
                                    <KeepAlive>
                                        <Component is={Component} key={route.path} ref={currentCom}></Component>
                                    </KeepAlive>
                                </Transition>
                            )
                        }}
                    />
                </RouterViewCon>
            </Container>
        )
    }
})