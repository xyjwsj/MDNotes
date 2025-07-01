import {DestroyModal, ModalView, ShowModal} from "@/util/modalUtil.tsx";
import {Button, Image, Input} from "ant-design-vue";
import {settingInfoStore} from "@/store/modules/settings.ts";
import {AddCategory, AllCategory, RemoveCategory, SelectCategory} from "@/bindings/changeme/handler/filehandler.ts";
import styled from "vue3-styled-components";
import {reactive, ref} from "vue";
import categoryDarkIcon from '@/assets/png/category-black.png'
import categoryLightIcon from '@/assets/png/category-light.png'
import {CategoryItem} from "@/bindings/changeme/model";
import {CloseOutlined, PlusOutlined} from "@ant-design/icons-vue";
import { $t } from '@/lang'

const CategoryView = styled.div`
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-left: 34px;
            gap: 10px;
            height: 30%;
            max-height: 350px;
            
            .content {
                padding: 10px;
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                overflow-y: auto;
                gap: 10px;
                max-height: 350px;
                
                .categoryItem {
                    line-height: 40px;
                    width: 95%;
                    position: relative;
                    border-radius: 5px;
                    text-align: center;
                    color: ${() =>
    settingInfoStore.DarkTheme() ? "rgba(255, 255, 255, 0.6)" : "gray"};
                    background-color: ${() =>
    settingInfoStore.DarkTheme()
        ? "rgba(255, 255, 255, 0.2)"
        : "rgba(255, 255, 255, 0.7)"};

                    &:hover {
                        box-shadow: 0 0 5px 1px ${() =>
    settingInfoStore.DarkTheme()
        ? "rgba(255, 255, 255, 0.8)"
        : "gray"};
                        color: ${() =>
    settingInfoStore.DarkTheme()
        ? "rgba(255, 255, 255, 0.8)"
        : "rgba(0, 0, 0, 0.8)"};
                    }
                    
                    .close {
                        position: absolute;
                        right: 10px;
                        top: 50%;
                        transform: translateY(-50%);
                    }
                }

                ::-webkit-scrollbar {
                    display: none;
                }
            }

            

            .inputEdit {
                height: 40px;
                width: 95%;
                background-color: ${() =>
    settingInfoStore.DarkTheme()
        ? "rgba(255, 255, 255, 0.3)"
        : "rgba(255, 255, 255, 0.7)"};
                color: ${() =>
    settingInfoStore.DarkTheme() ? "rgba(255, 255, 255, 0.6)" : "gray"};
                text-align: center;

                &:hover {
                    box-shadow: 0 0 5px 1px ${() =>
    settingInfoStore.DarkTheme()
        ? "rgba(255, 255, 255, 0.8)"
        : "gray"};
                    color: ${() =>
    settingInfoStore.DarkTheme()
        ? "rgba(255, 255, 255, 0.8)"
        : "rgba(0, 0, 0, 0.8)"};
                }
            }
        `;

const AddBtn = styled(Button)`
            border: none;
            width: 70%;
            height: 40px;
            background-color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.6)'};
            color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.2)'};

            &:hover {
                background-color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.8)'};
                color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.5)'};
            }
        `

const addRef = reactive({
    flag: false,
    content: '',
    overId: '',
})

const categoryList = ref<CategoryItem[]>([])

const delCategory = async (key: string) => {
    const res = await RemoveCategory(key)
    if (res) {
        const index = categoryList.value.findIndex(itm => key === itm.key);
        if (index !== -1) {
            categoryList.value.splice(index, 1);
        }
    }
}

const ChangeCategory = async () => {
    addRef.flag = false
    const modalView = new ModalView();
    modalView.cancelText = "";
    modalView.title = $t("category");
    modalView.okText = "";
    modalView.closed = true;
    modalView.width = "350px";
    modalView.icon = (
        <Image
            preview={false}
            width={25}
            src={settingInfoStore.DarkTheme() ? categoryDarkIcon : categoryLightIcon}
        />
    );

    modalView.content = (
        <CategoryView>
            <div class={"content"}>
                {categoryList.value.map((item) => {
                    return (
                        <div
                            class={"categoryItem"}
                            onMouseover={() => addRef.overId = item.key}
                            onMouseleave={() => addRef.overId = ""}
                            onClick={async () => {
                                await SelectCategory(item?.key!)
                                DestroyModal();
                                await LoadCategoryList()
                            }}
                        >
                            {item?.tag!}
                            {addRef.overId !== "" && addRef.overId === item.key && <CloseOutlined class={'close'} onClick={(e) => {
                                delCategory(item.key)
                                e.stopPropagation()
                            }}/>}
                        </div>
                    );
                })}
            </div>
            {addRef.flag ?
                <Input class={'inputEdit'}
                       bordered={false}
                       onChange={e => addRef.content = e.target.value!}
                       onPressEnter={async () => {
                           const cId = await AddCategory(addRef.content)
                           if (cId !== "") {
                               categoryList.value.push({
                                   key: cId,
                                   tag: addRef.content
                               })
                           }
                           addRef.flag = false
                           addRef.content = ""
                       }}></Input>
                :
                <AddBtn
                    // type="text"
                    style={{
                        width: '95%',
                    }}
                    icon={<PlusOutlined style={{
                        color: settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.4)',
                    }}/>}
                    onClick={() => addRef.flag = true}
                ></AddBtn>}
        </CategoryView>
    );
    // modalView.show();
    ShowModal(modalView);
};

const LoadCategoryList = async () => {
    const category = await AllCategory()
    categoryList.value.splice(0, categoryList.value.length);
    category.forEach((item) => {
        if (item !== null) {
            categoryList.value.push(item);
        }
    });

    const allCategory = {
        key: '',
        tag: $t('all')
    }
    categoryList.value.splice(0, 0, allCategory);
}

const FileCategoryDesc = (category: string) => {
    if (category === "") {
        return "Untitled"
    }
    const filter = categoryList.value.filter(itm => itm.key === category);
    if (filter.length == 0) {
        return "Untitled"
    }
    return filter[0].tag
};

export {
    ChangeCategory,
    LoadCategoryList,
    FileCategoryDesc,
    categoryList
}