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
import {currentTheme} from "@/style/theme.ts";

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
                    color: ${() => currentTheme.value.colors.dialogItem};
                    background-color: ${() => currentTheme.value.colors.dialogItemBackground};

                    &:hover {
                        box-shadow: 0 0 5px 1px ${() => currentTheme.value.colors.dialogItemHoverShadow};
                        color: ${() => currentTheme.value.colors.dialogItemHover};
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
                background-color: ${() => currentTheme.value.colors.dialogInputBackground};
                color: ${() => currentTheme.value.colors.dialogInput};
                text-align: center;

                &:hover {
                    box-shadow: 0 0 5px 1px ${() => currentTheme.value.colors.dialogInputHover};
                    color: ${() => currentTheme.value.colors.dialogInputHover};
                }
            }
        `;

const AddBtn = styled(Button)`
            border: none;
            width: 70%;
            height: 40px;
            background-color: ${() => currentTheme.value.colors.dialogBtnBackground};
            color: ${() => currentTheme.value.colors.dialogBtn};

            &:hover {
                background-color: ${() => currentTheme.value.colors.dialogBtnHoverBackground};
                color: ${() => currentTheme.value.colors.dialogBtnHover};
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
                        color: currentTheme.value.colors.icon,
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