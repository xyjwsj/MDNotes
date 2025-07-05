import {DestroyModal, ModalView, ShowModal} from "@/util/modalUtil.tsx";
import {Image} from "ant-design-vue";
import {settingInfoStore} from "@/store/modules/settings.ts";
import {reactive} from "vue";
import wxpLightIcon from "@/assets/png/wxp-white.png";
import wxpDarkIcon from "@/assets/png/wxp-black.png";
import {
    chartsContent,
    graphvizContent,
    gsContent,
    gttContent,
    lctContent,
    ntContent,
    sxtContent,
    wxpContent
} from "@/util/template.ts";
import gsLightIcon from "@/assets/png/gs-white.png";
import gsDarkIcon from "@/assets/png/gs-black.png";
import ntLightIcon from "@/assets/png/nt-white.png";
import ntDarkIcon from "@/assets/png/nt-black.png";
import lctLightIcon from "@/assets/png/lct-white.png";
import lctDarkIcon from "@/assets/png/lct-black.png";
import sxtLightIcon from "@/assets/png/sxt-white.png";
import sxtDarkIcon from "@/assets/png/sxt-black.png";
import gttLightIcon from "@/assets/png/gtt-white.png";
import gttDarkIcon from "@/assets/png/gtt-black.png";
import graphvizLightIcon from "@/assets/png/graphviz-white.png";
import graphvizDarkIcon from "@/assets/png/graphviz-black.png";
import chartsLightIcon from "@/assets/png/charts-light.png";
import chartsDarkIcon from "@/assets/png/charts-black.png";
import {$t} from '@/lang'
import styled from "vue3-styled-components";
import {currentTheme} from "@/style/theme.ts";


const TemplateView = styled.div`
            max-height: 450px;
            overflow-y: auto;
            border-radius: 8px;
            padding: 20px 5px;

            ::-webkit-scrollbar {
                display: none;
            }

            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 40px;
            justify-content: space-around;

            .item {
                padding: 10px 5px;
                color: ${() => currentTheme.value.colors.dialogItem};
                //width: 120px;
                height: 120px;
                width: 40%;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;

                &:hover {
                    box-shadow: 0 0 5px 2px ${() => currentTheme.value.colors.dialogItemHover};
                }
            }
        `;

const templateInfo = reactive([
    {
        name: $t('staffNotation'),
        lightIcon: wxpLightIcon,
        darkIcon: wxpDarkIcon,
        key: "wxp",
        template: wxpContent,
    },
    {
        name: $t('formula'),
        lightIcon: gsLightIcon,
        darkIcon: gsDarkIcon,
        key: "gs",
        template: gsContent,
    },
    {
        name: $t('mindMap'),
        lightIcon: ntLightIcon,
        darkIcon: ntDarkIcon,
        key: "nt",
        template: ntContent,
    },
    {
        name: $t('flowchart'),
        lightIcon: lctLightIcon,
        darkIcon: lctDarkIcon,
        key: "lct",
        template: lctContent,
    },
    {
        name: $t('sequenceDiagram'),
        lightIcon: sxtLightIcon,
        darkIcon: sxtDarkIcon,
        key: "sxt",
        template: sxtContent,
    },
    {
        name: $t('ganttChart'),
        lightIcon: gttLightIcon,
        darkIcon: gttDarkIcon,
        key: "gtt",
        template: gttContent,
    },
    {
        name: "Graphviz",
        lightIcon: graphvizLightIcon,
        darkIcon: graphvizDarkIcon,
        key: "graphviz",
        template: graphvizContent,
    },
    {
        name: "Chart",
        lightIcon: chartsLightIcon,
        darkIcon: chartsDarkIcon,
        key: "chart",
        template: chartsContent,
    },
]);

const ShowMDTemplate = (callback: (content: string) => void) => {
    const modalView = new ModalView();
    modalView.title = "选择插入模版";
    modalView.okText = "";
    modalView.cancelText = "";
    modalView.closed = true;
    modalView.width = "60%";
    modalView.content = (
        <TemplateView>
            {templateInfo.map((item) => {
                return (
                    <div
                        class={"item"}
                        onDblclick={async () => {
                            callback(item.template)
                            // const content =
                            //     vditor.value?.getValue() + "\n" + item.template;
                            // vditor.value!.setValue(content, true);
                            // await syncContent(content);
                            DestroyModal();
                        }}
                    >
                        <Image
                            style={{
                                height: "100px",
                            }}
                            src={
                                settingInfoStore.DarkTheme()
                                    ? item.darkIcon
                                    : item.lightIcon
                            }
                            preview={false}
                        ></Image>
                        <span>{item.name}</span>
                    </div>
                );
            })}
        </TemplateView>
    );
    // modalView.show();
    ShowModal(modalView);
};

export {
    ShowMDTemplate
}