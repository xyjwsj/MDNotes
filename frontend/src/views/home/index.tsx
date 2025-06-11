import graphvizDarkIcon from "@/assets/png/graphviz-black.png";
import graphvizLightIcon from "@/assets/png/graphviz-white.png";
import gsDarkIcon from "@/assets/png/gs-black.png";
import gsLightIcon from "@/assets/png/gs-white.png";
import gttDarkIcon from "@/assets/png/gtt-black.png";
import gttLightIcon from "@/assets/png/gtt-white.png";
import lctDarkIcon from "@/assets/png/lct-black.png";
import lctLightIcon from "@/assets/png/lct-white.png";
import ntDarkIcon from "@/assets/png/nt-black.png";
import ntLightIcon from "@/assets/png/nt-white.png";
import sxtDarkIcon from "@/assets/png/sxt-black.png";
import sxtLightIcon from "@/assets/png/sxt-white.png";
import wxpDarkIcon from "@/assets/png/wxp-black.png";
import wxpLightIcon from "@/assets/png/wxp-white.png";
import {
  FileContent,
  SyncFile,
} from "@/bindings/changeme/handler/filehandler.js";
import { RecordInfo } from "@/bindings/changeme/model";
import { settingInfoStore } from "@/store/modules/settings.ts";
import { DestroyModal, ModalView, ShowModal } from "@/util/modalUtil.tsx";
import { Image } from "ant-design-vue";
import Vditor from "vditor";
import { defineComponent, inject, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import styled from "vue3-styled-components";

export default defineComponent({
  name: "Home",
  setup(_, { expose }) {
    const { t } = useI18n();

    const Container = styled.div`
      margin: 0 auto;
      height: 100%;
      width: 100%;
      border: none;
      position: relative;

      .vditor-reset {
        padding: 10px 30px !important;
      }

      .counter {
        position: absolute;
        top: 0;
        right: 0;
        height: 15px;
        width: 30px;
        background-color: ${() =>
          settingInfoStore.DarkTheme() ? "#2B2D30" : "#E0E0E3"};
        color: gray;
        text-align: center;
        font-size: 12px;
      }
    `;

    const EditorView = styled.div`
      border: none !important;
      height: 100px;

      .vditor-toolbar {
        border: none;
      }
    `;

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
        color: ${() => (settingInfoStore.DarkTheme() ? "white" : "black")};
        //width: 120px;
        height: 120px;
        width: 40%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        &:hover {
          box-shadow: 0 0 5px 2px
            ${() =>
              settingInfoStore.DarkTheme()
                ? "rgba(255, 255, 255, 0.8)"
                : "gray"};
        }
      }
    `;

    const wxpContent = "";
    const gsContent =
      "$$\n" +
      "\\frac{1}{\n" +
      "  \\Bigl(\\sqrt{\\phi \\sqrt{5}}-\\phi\\Bigr) e^{\n" +
      "  \\frac25 \\pi}} = 1+\\frac{e^{-2\\pi}} {1+\\frac{e^{-4\\pi}} {\n" +
      "    1+\\frac{e^{-6\\pi}}\n" +
      "    {1+\\frac{e^{-8\\pi}}{1+\\cdots}}\n" +
      "  }\n" +
      "}";

    const lctContent =
      "```mermaid\n" +
      "graph TB\n" +
      "    c1-->a2\n" +
      "    subgraph one\n" +
      "    a1-->a2\n" +
      "    end\n" +
      "    subgraph two\n" +
      "    b1-->b2\n" +
      "    end\n" +
      "    subgraph three\n" +
      "    c1-->c2\n" +
      "    end";

    const ntContent =
      "```mindmap\n" +
      "- 教程\n" +
      "- 语法指导\n" +
      "  - 普通内容\n" +
      "  - 提及用户\n" +
      "  - 表情符号 Emoji\n" +
      "    - 一些表情例子\n" +
      "  - 大标题 - Heading 3\n" +
      "    - Heading 4\n" +
      "      - Heading 5\n" +
      "        - Heading 6\n" +
      "  - 图片\n" +
      "  - 代码块\n" +
      "    - 普通\n" +
      "    - 语法高亮支持\n" +
      "      - 演示 Go 代码高亮\n" +
      "      - 演示 Java 高亮\n" +
      "  - 有序、无序、任务列表\n" +
      "    - 无序列表\n" +
      "    - 有序列表\n" +
      "    - 任务列表\n" +
      "  - 表格\n" +
      "- 快捷键";

    const sxtContent =
      "```mermaid\n" +
      "sequenceDiagram\n" +
      "    Alice->>John: Hello John, how are you?\n" +
      "    loop Every minute\n" +
      "        John-->>Alice: Great!\n" +
      "    end";

    const gttContent =
      "```mermaid\n" +
      "gantt\n" +
      "    title A Gantt Diagram\n" +
      "    dateFormat  YYYY-MM-DD\n" +
      "    section Section\n" +
      "    A task           :a1, 2019-01-01, 30d\n" +
      "    Another task     :after a1  , 20d\n" +
      "    section Another\n" +
      "    Task in sec      :2019-01-12  , 12d\n" +
      "    another task      : 24d";

    const graphvizContent =
      "```graphviz\n" +
      "digraph finite_state_machine {\n" +
      "    rankdir=LR;\n" +
      '    size="8,5"\n' +
      "    node [shape = doublecircle]; S;\n" +
      "    node [shape = point ]; qi\n" +
      "\n" +
      "    node [shape = circle];\n" +
      "    qi -> S;\n" +
      '    S  -> q1 [ label = "a" ];\n' +
      '    S  -> S  [ label = "a" ];\n' +
      '    q1 -> S  [ label = "a" ];\n' +
      '    q1 -> q2 [ label = "ddb" ];\n' +
      '    q2 -> q1 [ label = "b" ];\n' +
      '    q2 -> q2 [ label = "b" ];\n' +
      "}";

    const templateInfo = reactive([
      {
        name: "五线谱",
        lightIcon: wxpLightIcon,
        darkIcon: wxpDarkIcon,
        key: "wxp",
        template: wxpContent,
      },
      {
        name: "数学公式",
        lightIcon: gsLightIcon,
        darkIcon: gsDarkIcon,
        key: "gs",
        template: gsContent,
      },
      {
        name: "脑图",
        lightIcon: ntLightIcon,
        darkIcon: ntDarkIcon,
        key: "nt",
        template: ntContent,
      },
      {
        name: "流程图",
        lightIcon: lctLightIcon,
        darkIcon: lctDarkIcon,
        key: "lct",
        template: lctContent,
      },
      {
        name: "时序图",
        lightIcon: sxtLightIcon,
        darkIcon: sxtDarkIcon,
        key: "sxt",
        template: sxtContent,
      },
      {
        name: "甘特图",
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
    ]);

    const editorInfo = reactive({
      fileKey: "",
      fileName: "",
      create: "",
    });

    const updateFileSize: any = inject("updateFileSize");

    const wordCounter = ref(0);
    const vditorRef = ref<any>(null);
    const vditor = ref<Vditor | null>(null);

    onMounted(() => {
      console.log("vditorRerf", vditorRef);
      initVditor("");
    });

    const syncContent = async (content: string) => {
      const success = await SyncFile(editorInfo.fileKey, content);
      if (success !== "") {
        updateFileSize(editorInfo.fileKey, success);
      }
      wordCounter.value = content.length;
      console.log("SyncFile", editorInfo.fileName, success);
    };

    const initVditor = (defaultVal: string) => {
      vditor.value = new Vditor("vditor", {
        theme: settingInfoStore.DarkTheme() ? "dark" : "classic",
        // theme: 'dark',
        // height: "810px",
        height: "100%",
        width: "100%",
        toolbar: [],
        toolbarConfig: {
          hide: false,
        },
        placeholder: t("editorPlaceholder"),
        cache: {
          enable: true,
        },
        cdn: "/mdNotes/vditor",
        after: () => {
          vditor.value?.setTheme(
            settingInfoStore.DarkTheme() ? "dark" : "classic",
            settingInfoStore.DarkTheme() ? "dark" : "wechat"
          );
        },
        input: async (val: string) => {
          syncContent(val);
        },
        upload: {
          accept: "image/*",
          url: "/api/upload",
          linkToImgUrl: "/api/upload",
          format: (files: File[], responseText: string) => {
            const data = {
              msg: "",
              code: 0,
              data: {
                errFiles: [],
                succMap: {},
              },
            };
            (data.data.succMap as any)[files[0].name] = responseText;

            console.log("%%%%%%%%", responseText, data);
            return JSON.stringify(data);
          },
          linkToImgCallback: (responseText: string) => {
            console.log("%%%%%%%%", responseText);
          },
          linkToImgFormat: (responseText: string) => {
            console.log("########", responseText);
            return "";
          },
        },
        value: defaultVal,
        // 代码高亮
        mode: "ir",
        preview: {
          delay: 0,
          hljs: {
            style: "monokai",
            lineNumber: true,
          },
        },
      });
      console.log("vditor init success...");
    };

    onMounted(async () => {});

    const updateTheme = () => {
      vditor.value?.setTheme(
        settingInfoStore.DarkTheme() ? "dark" : "classic",
        settingInfoStore.DarkTheme() ? "dark" : "classic",
        settingInfoStore.DarkTheme() ? "dark" : "github"
      );
    };

    const updateContent = async (info: RecordInfo) => {
      if (editorInfo.fileKey !== info.uuid) {
        const content = await FileContent(info.uuid);
        console.log("ref", vditorRef);
        vditor.value!.setValue(content, true);
        wordCounter.value = content.length;
      }
      editorInfo.fileName = info.fileName;
      editorInfo.create = info.create;
      editorInfo.fileKey = info.uuid;
    };
    // expose({updateTheme})

    const showMDTemplate = () => {
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
                  const content =
                    vditor.value?.getValue() + "\n" + item.template;
                  vditor.value!.setValue(content, true);
                  await syncContent(content);
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

    const startEdit = () => {
      vditor.value?.focus();
    };

    expose({ updateContent, updateTheme, startEdit });

    return () => (
      <Container>
        <EditorView
          id="vditor"
          ref={(el) => (vditorRef.value = el)}
          onKeydown={(event) => {
            if (event.metaKey) {
              if (event.key === "i") {
                showMDTemplate();
                event.stopPropagation();
                return;
              }
            }
            if (event.key === "Escape") {
              DestroyModal();
              vditor.value?.focus();
              event.stopPropagation();
              return;
            }
          }}
        ></EditorView>
        <span class={"counter"}>{wordCounter.value}</span>
      </Container>
    );
  },
});
