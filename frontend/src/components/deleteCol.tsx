import styled from "vue3-styled-components";
import {settingInfoStore} from "@/store/modules/settings.ts";
import {DestroyModal, ModalView, ShowModal} from "@/util/modalUtil.tsx";
import {Empty, Image} from "ant-design-vue";
import garbageLightIcon from "@/assets/png/garbage-light.png";
import garbageDarkIcon from "@/assets/png/garbage-black.png";
import {CleanRecoveryFile, DeleteList, Recovery} from "@/bindings/changeme/handler/filehandler.ts";
import {DeleteOutlined, UndoOutlined} from "@ant-design/icons-vue";
import {TipError} from "@/util/messageUtil.tsx";
import {$t} from '@/lang'
import {RecordInfo} from "@/bindings/changeme/model";
import {currentTheme} from "@/style/theme.ts";

const DeleteView = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    //margin-left: 50px;
    position: relative;
    text-align: center;
    padding: 10px 0;
    width: 510px;
    gap: 8px;
    max-height: 350px;
    overflow-y: auto;

    ::-webkit-scrollbar {
        display: none;
    }

    .item {
        width: 80%;
        line-height: 35px;
        padding: 0 10px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        border-radius: 8px;

        color: ${() => currentTheme.value.colors.dialogBtn};
        background-color: ${() => currentTheme.value.colors.dialogBtnBackground};

        &:hover {
            box-shadow: 0 0 5px 1px ${() => currentTheme.value.colors.dialogBtnHoverShadow};
            color: ${() => currentTheme.value.colors.dialogBtnHover};
        }
    }

    .right {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;

        .time {
            font-size: 12px;
        }
    }
`

const ShowDelFile = async (callback: (record: RecordInfo) => void) => {
    const modalView = new ModalView();
    modalView.cancelText = "";
    modalView.okText = "";
    modalView.title = $t("deleteFileList");
    modalView.okText = "";
    modalView.closed = true;
    modalView.width = "550px";
    modalView.icon = (
        <Image
            preview={false}
            width={25}
            src={settingInfoStore.DarkTheme() ? garbageLightIcon : garbageDarkIcon}
        />
    );
    const list = await DeleteList();
    modalView.content = (
        <DeleteView>
            {list.length > 0 ? list.map(item => {
                    return <div class={'item'}>
                        <span>{item?.fileName}</span>
                        <div class={'right'}>
                            <span class={'time'}>{`${item?.del} ${$t("delete")}`}</span>
                            <UndoOutlined class={'recovery'} onClick={async () => {
                                const res = await Recovery(item?.uuid!)
                                if (res) {
                                    callback(item!)
                                    DestroyModal()
                                    return
                                }
                                TipError($t('recoveryFailure'))
                            }}/>
                            <DeleteOutlined onClick={async () => {
                                const res = await CleanRecoveryFile(item?.uuid!)
                                if (res) {
                                    DestroyModal()
                                    return
                                }
                                TipError($t('cleanFileFailure'))
                            }}/>
                        </div>
                    </div>
                }) :
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    imageStyle={{
                        backgroundColor: '',
                    }}
                    style={{
                        color: currentTheme.value.colors.dialogNoData,
                    }}
                    description={'暂无数据'}></Empty>}
        </DeleteView>
    );
    // modalView.show();
    ShowModal(modalView);
}

export {
    ShowDelFile
}