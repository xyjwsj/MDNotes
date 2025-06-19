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
import {FileContent, SyncFile, TypeExport,} from "@/bindings/changeme/handler/filehandler.js";
import {RecordInfo} from "@/bindings/changeme/model";
import {settingInfoStore} from "@/store/modules/settings.ts";
import {DestroyModal, ModalView, ShowModal} from "@/util/modalUtil.tsx";
import {Image} from "ant-design-vue";
import Vditor from "vditor";
import {defineComponent, inject, onMounted, onUnmounted, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import styled from "vue3-styled-components";
import moment from "moment";
import {SameDay} from "@/util/dateUtil.ts";
import {ReloadOutlined} from "@ant-design/icons-vue";

export default defineComponent({
  name: "Home",
  setup(_, { expose }) {
    const { t } = useI18n();

    const Container = styled.div`
      margin: 0 auto;
      height: 100%;
      width: 100%;
      border: none;
      //position: relative; // 这里会引起编辑区在最后一行发生跳动问题

      .vditor-reset {
        padding: 30px 30px !important;
        overflow-y: auto;

        ::-webkit-scrollbar {
          display: none;
        }
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
      
      .info {
        position: absolute;
        bottom: 0;
        width: 100%;
        right: 0;
        height: 25px;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        font-size: 10px;
        align-items: center;
        color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.3)' : 'lightgray'};
        //gap: 15px;
        .item {
          line-height: 15px;
          margin-right: 10px;
          padding-left: 15px;
        }
        .icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 15px;
          width: 30px;
          height: 25px;
        }
        
        .async-ing {
          color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.6)' : 'gray'};;
        }
      }
    `;

    const EditorView = styled.div`
      border: none !important;
      //height: 100px;

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

    const wxpContent = "```abc\n" +
        "X: 24\n" +
        "T: Clouds Thicken\n" +
        "C: Paul Rosen\n" +
        "S: Copyright 2005, Paul Rosen\n" +
        "M: 6/8\n" +
        "L: 1/8\n" +
        "Q: 3/8=116\n" +
        "R: Creepy Jig\n" +
        "K: Em\n" +
        "|:\"Em\"EEE E2G|\"C7\"_B2A G2F|\"Em\"EEE E2G|\\\\\n" +
        "\"C7\"_B2A \"B7\"=B3|\"Em\"EEE E2G|\n" +
        "\"C7\"_B2A G2F|\"Em\"GFE \"D (Bm7)\"F2D|\\\\\n" +
        "1\"Em\"E3-E3:|2\"Em\"E3-E2B|:\"Em\"e2e gfe|\n" +
        "\"G\"g2ab3|\"Em\"gfeg2e|\"D\"fedB2A|\"Em\"e2e gfe|\\\\\n" +
        "\"G\"g2ab3|\"Em\"gfe\"D\"f2d|\"Em\"e3-e3:|\n" +
        "```";
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
        name: t('staffNotation'),
        lightIcon: wxpLightIcon,
        darkIcon: wxpDarkIcon,
        key: "wxp",
        template: wxpContent,
      },
      {
        name: t('formula'),
        lightIcon: gsLightIcon,
        darkIcon: gsDarkIcon,
        key: "gs",
        template: gsContent,
      },
      {
        name: t('mindMap'),
        lightIcon: ntLightIcon,
        darkIcon: ntDarkIcon,
        key: "nt",
        template: ntContent,
      },
      {
        name: t('flowchart'),
        lightIcon: lctLightIcon,
        darkIcon: lctDarkIcon,
        key: "lct",
        template: lctContent,
      },
      {
        name: t('sequenceDiagram'),
        lightIcon: sxtLightIcon,
        darkIcon: sxtDarkIcon,
        key: "sxt",
        template: sxtContent,
      },
      {
        name: t('ganttChart'),
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
      update: "",
      row: 0,
      column: 0
    });

    const updateFileSize: any = inject("updateFileSize");

    const wordCounter = ref(0);
    const vditorRef = ref<any>(null);
    const vditor = ref<Vditor | null>(null);

    onMounted(() => {
      console.log("vditorRerf", vditorRef);
      if (vditor.value === null) {
        initVditor("");
      }
    });

    onUnmounted(() => {
      if (vditor.value !== null) {
        vditor.value.destroy()
        vditor.value = null
      }
    })

    const syncContent = async (content: string) => {
      if (editorInfo.fileKey !== "") {
        const success = await SyncFile(editorInfo.fileKey, content);
        if (success !== "") {
          updateFileSize(editorInfo.fileKey, success);
        }
      }
      wordCounter.value = content.length;
    };

    const initVditor = (defaultVal: string) => {
      vditor.value = new Vditor("vditor", {
        theme: settingInfoStore.DarkTheme() ? "dark" : "classic",
        // theme: 'dark',
        // height: "810px",
        height: '100%',
        width: "100%",
        toolbar: [],
        toolbarConfig: {
          hide: false,
        },
        placeholder: t("editorPlaceholder"),
        cache: {
          enable: false,
        },
        cdn: "/mdNotes/vditor",
        after: () => {
          vditor.value?.setTheme(
            settingInfoStore.DarkTheme() ? "dark" : "classic",
            settingInfoStore.DarkTheme() ? "dark" : "wechat"
          );
        },
        input: async (val: string) => {
          startSpin()
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
      if (info.modify !== null) {
        editorInfo.update = info.modify
      }
    };
    // expose({updateTheme})

    const showMDTemplate = () => {
      let cursorPosition = vditor.value?.getCursorPosition();
      if (cursorPosition) {
        editorInfo.row = cursorPosition.top
        editorInfo.column = cursorPosition.left
      }
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

    const exportHtml = (typ: string) => {
      TypeExport(typ, editorInfo.fileKey, vditor.value?.getHTML()!)
    }

    expose({ updateContent, updateTheme, startEdit, exportHtml });


    const formatDate = (str: string) => {
      const dateStr = str.split(" ");
      const dateObj = moment(str);
      const now = moment();
      let formatStr = str;
      if (SameDay(now.toDate(), dateObj.toDate())) {
        formatStr = `${t("today")} ` + dateStr[1];
      }
      let res = dateObj.add(1, "days");
      if (SameDay(now.toDate(), res.toDate())) {
        formatStr = `${t("yesterday")} ` + dateStr[1];
      }
      // res = dateObj.add(2, "days");
      // if (SameDay(now.toDate(), res.toDate())) {
      //   formatStr = "前天 " + dateStr[1];
      // }
      return formatStr;
    };

    const createDatetime = () => {
      return `${formatDate(editorInfo.create)} ${t("create")}`;
    };

    const updateDatetime = () => {
      return `${formatDate(editorInfo.update)} ${t("update")}`;
    }

    const async = ref(false)

    const startSpin = () => {
      async.value = true
      editorInfo.update = moment().format('YYYY-MM-DD HH:mm:ss')
      setTimeout(() => {
        async.value = false
      }, 2000)
    }

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
        <div class={"info"}>
          {editorInfo.create !== "" && <span class={"item"}>{createDatetime()}</span>}
          {editorInfo.update !== "" && <span class={"item"}>{updateDatetime()}</span>}
          <div class={['icon-wrapper', async.value ? 'async-ing' : '']}>
            <ReloadOutlined spin={async.value} />
          </div>
        </div>
      </Container>
    );
  },
});
