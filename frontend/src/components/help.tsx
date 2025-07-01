import {ModalView, ShowModal} from "@/util/modalUtil.tsx";
import {QuestionOutlined} from "@ant-design/icons-vue";
import {settingInfoStore} from "@/store/modules/settings.ts";
import {HelpInfo} from "@/bindings/changeme/handler/systemhandler.ts";
import { $t } from '@/lang'
import styled from "vue3-styled-components";

const HelpView = styled.pre`
    padding: 10px;
    margin-right: 15px;
    max-height: 350px;
    overflow-y: auto;
    text-wrap: wrap;
    border-radius: 8px;
    background-color: ${() => settingInfoStore.DarkTheme() ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.4)'};
    box-shadow: 0 0 10px 5px ${() => settingInfoStore.DarkTheme() ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.5)'};
    color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.2)'};

    ::-webkit-scrollbar {
        display: none;
    }
`

const ShowHelp = async () => {
    const modalView = new ModalView();
    modalView.cancelText = "";
    modalView.okText = "";
    modalView.title = $t("help");
    modalView.okText = "";
    modalView.closed = true;
    modalView.width = "650px";
    modalView.icon = (
        <QuestionOutlined
            style={{color: settingInfoStore.DarkTheme() ? "white" : "black"}}
        />
    );
    const info = await HelpInfo(settingInfoStore.getState().lang);
    modalView.content = (
        <HelpView>
            {info}
        </HelpView>
    );
    // modalView.show();
    ShowModal(modalView);
}

export {
    ShowHelp
}