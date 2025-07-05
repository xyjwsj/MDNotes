import styled from "vue3-styled-components";
import {reactive} from "vue";
import {DestroyModal, ModalView, ShowModal} from "@/util/modalUtil.tsx";
import {ExportOutlined} from "@ant-design/icons-vue";
import {$t} from '@/lang'
import {currentTheme} from "@/style/theme.ts";

const ExportView = styled.div`
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-right: 20px;
            gap: 10px;
            height: 30%;
            overflow-y: auto;
            padding: 10px;

            ::-webkit-scrollbar {
                display: none;
            }

            .langItem {
                line-height: 40px;
                width: 95%;
                border-radius: 5px;
                text-align: center;
                color: ${() => currentTheme.value.colors.dialogItem};
                background-color: ${() => currentTheme.value.colors.dialogItemBackground};

                &:hover {
                    box-shadow: 0 0 5px 1px ${() => currentTheme.value.colors.dialogItemHoverShadow};
                    color: ${() => currentTheme.value.colors.dialogBtnHover};
                }
            }
        `;

const exportTypeInfo = reactive([
    {
        key: 'html',
        val: 'HTML',
    },
    {
        key: 'pdf',
        val: 'PDF',
    },
    {
        key: 'word',
        val: 'Word',
    },
    {
        key: 'md',
        val: 'MarkDown'
    }
]);


const FileExport = (callback: (key: string) => void) => {
    const modalView = new ModalView();
    modalView.cancelText = "";
    modalView.okText = "";
    modalView.title = $t("export");
    modalView.okText = "";
    modalView.closed = true;
    modalView.width = "350px";
    modalView.icon = (
        <ExportOutlined
            style={{color: currentTheme.value.colors.dialogIcon}}
        />
    );
    modalView.content = (
        <ExportView>
            {exportTypeInfo.map((item) => {
                return (
                    <span
                        class={"langItem"}
                        onClick={() => {
                            callback(item.key)
                            DestroyModal();
                        }}
                    >
                {$t(item.val)}
              </span>
                );
            })}
        </ExportView>
    );
    // modalView.show();
    ShowModal(modalView);
};

export {
    FileExport
}