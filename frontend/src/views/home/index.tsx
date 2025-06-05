import {FileContent, SyncFile,} from "@/bindings/changeme/handler/filehandler.js";
import {RecordInfo} from "@/bindings/changeme/model";
import {SameDay} from "@/util/dateUtil.ts";
import {BlockOutlined, DeleteOutlined, ExportOutlined, SettingOutlined,} from "@ant-design/icons-vue";
import moment from "moment";
import Vditor from "vditor";
import {defineComponent, inject, onMounted, reactive, ref} from "vue";
import styled from "vue3-styled-components";
import {settingInfoStore} from "@/store/modules/settings.ts";

export default defineComponent({
  name: "Home",
  setup(_, { expose }) {
    const Container = styled.div`
      margin: 0 auto;
      height: 100%;
      width: 100%;
      border: none;

      .tools {
        background-color: ${() => settingInfoStore.DarkTheme() ? '#2b2d31' : 'rgba(239, 239, 242, 0.6)'};
        height: 45px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;

        .create {
          font-size: 12px;
          color: gray;
        }

        .actions {
          height: 45px;
          color: lightgray;
          font-size: 17px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 15px;

          .action {
            height: 45px;
            color: ${() => settingInfoStore.DarkTheme() ? 'gray' : 'lightgray'};;
            font-size: 17px;
            display: flex;
            justify-content: flex-end;
            align-items: center;

            &:hover {
              color: ${() => settingInfoStore.DarkTheme() ? 'lightgray' : 'gray'};;;
            }
          }
        }
      }

      .settingDialog {
        background: transparent;
        //内容

        :global(.ant-modal-content) {
          background-color: rgba(0, 0, 0, 0.1) !important;
          border-radius: 5px !important;
          //width: 350px !important;

          .ant-modal-header {
            //background: transparent !important;
            border-radius: 0 !important;
          }

          :global(.ant-modal-title) {
            color: gray !important;
            background-color: rgba(0, 0, 0, 0.1) !important;
          }
        }
      }
    `;

    const EditorView = styled.div`
      border: none;
      height: 100px;

      .vditor-toolbar {
        border: none;
      }
    `;

    const editorInfo = reactive({
      fileKey: "",
      fileName: "",
      create: "",
    });

    const deleteFile: any = inject("deleteFile");
    const exportFile: any = inject("exportFile");
    const configStore: any = inject('configStore')
    const updateFileSize: any = inject("updateFileSize");

    const vditorRef = ref<any>(null);
    const vditor = ref<Vditor | null>(null);

    onMounted(() => {
      console.log("vditorRerf", vditorRef);
      initVditor("");
    });

    const initVditor = (defaultVal: string) => {
      vditor.value = new Vditor("vditor", {
        theme: settingInfoStore.DarkTheme() ? 'dark': 'classic',
        height: "805px",
        toolbar: [],
        toolbarConfig: {
          hide: false,
        },
        placeholder: "请在这里输入内容",
        cache: {
          enable: true,
        },
        after: () => {
          vditor.value?.setTheme(settingInfoStore.DarkTheme() ? 'dark': 'classic', settingInfoStore.DarkTheme() ? 'dark': 'classic');
        },
        input: async (val: string) => {
          const success = await SyncFile(editorInfo.fileKey, val);
          if (success !== "") {
            updateFileSize(editorInfo.fileKey, success);
          }
          console.log("SyncFile", editorInfo.fileName, success);
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

    onMounted(async () => {

    });

    const updateContent = async (info: RecordInfo) => {
      console.log(info);
      if (editorInfo.fileKey !== info.uuid) {
        const content = await FileContent(info.uuid);
        console.log("ref", vditorRef);
        vditor.value!.setValue(content, true);
      }
      editorInfo.fileName = info.fileName;
      editorInfo.create = info.create;
      editorInfo.fileKey = info.uuid;
    };

    expose({ updateContent });

    const formatDate = (str: string) => {
      const dateStr = str.split(" ");
      const dateObj = moment(str);
      const now = moment();
      let formatStr = str;
      if (SameDay(now.toDate(), dateObj.toDate())) {
        formatStr = "今天 " + dateStr[1];
      }
      let res = dateObj.add(1, "days");
      if (SameDay(now.toDate(), res.toDate())) {
        formatStr = "昨天 " + dateStr[1];
      }
      res = dateObj.add(2, "days");
      if (SameDay(now.toDate(), res.toDate())) {
        formatStr = "前天 " + dateStr[1];
      }
      return formatStr;
    };

    const SwitchTheme = () => {
      settingInfoStore.SwitchTheme()
      vditor.value?.setTheme(settingInfoStore.DarkTheme() ? 'dark': 'classic', settingInfoStore.DarkTheme() ? 'dark': 'classic');
    }

    return () => (
      <Container>
        <div class={"tools"}>
          <div class={"info"}>
            {editorInfo.create && (
                <span class={"create"}>{`${formatDate(
                    editorInfo.create
                )}创建`}</span>
            )}
          </div>
          <div class={"actions"}>
            <div
              class={"action"}
              onClick={() => deleteFile(editorInfo.fileKey)}
            >
              <DeleteOutlined />
            </div>
            <div
              class={"action"}
              onClick={() => {
                exportFile(editorInfo.fileKey)
              }}
            >
              <ExportOutlined />
            </div>
            <div class={"action"} onClick={() => configStore()}>
              <SettingOutlined />
            </div>
            <div class={"action"} onClick={SwitchTheme}>
              <BlockOutlined />
            </div>
          </div>
        </div>
        <EditorView
          id="vditor"
          ref={(el) => (vditorRef.value = el)}
        ></EditorView>
      </Container>
    );
  },
});
