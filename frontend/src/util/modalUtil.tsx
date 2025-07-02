import { settingInfoStore } from "@/store/modules/settings.ts";
import { CloseOutlined, InfoCircleOutlined } from "@ant-design/icons-vue";
import { Button, Modal } from "ant-design-vue";
import styled from "vue3-styled-components";
import "./modal.css";

// const {t} = useI18n();

const ActionBtn = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  margin-top: 10px;
  justify-content: center;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;

  .btn {
    background-color: ${() =>
      settingInfoStore.DarkTheme() ? "#3a383a" : "lightgray"};
    border: none;
    color: ${() => (settingInfoStore.DarkTheme() ? "lightgray" : "gray")};

    &:hover {
      background-color: ${() =>
        settingInfoStore.DarkTheme() ? "#4E4B4E" : "white"};
      color: ${() => (settingInfoStore.DarkTheme() ? "white" : "black")};
    }
  }
`;

let modalViewStore: ModalView | null = null;

class ModalView {
  public content: any;
  public ok?: () => void;
  public okCall?: () => Promise<boolean>;
  public cancel?: () => void;
  public cancelCall?: () => Promise<boolean>;
  public close?: () => void;
  public closed: boolean;
  public title: string;
  public okText: string;
  public cancelText: string;
  public width: number | string;
  public icon: any;
  public modal: any;

  constructor() {
    this.title = "删除";
    this.okText = "确定";
    this.cancelText = "取消";
    this.closed = false;
    this.width = 300;
    this.icon = (
      <InfoCircleOutlined
        style={{ color: settingInfoStore.DarkTheme() ? "white" : "black" }}
      />
    );
  }

  public show() {
    this.modal = Modal.confirm({
      style: {
        backgroundColor: settingInfoStore.DarkTheme()
          ? "#1D1D1B !important"
          : "#FFFFFD !important",
        color: settingInfoStore.DarkTheme() ? "white" : "black",
        borderRadius: "10px",
        boxShadow: settingInfoStore.DarkTheme() ? "0 0 15px 1px gray" : "0 0 15px 1px lightGray",
      },
      closeIcon: (
        <CloseOutlined
          style={{ color: settingInfoStore.DarkTheme() ? "white" : "black" }}
          onClick={() => this.modal.destroy()}
        />
      ),
      width: this.width,
      title: (
        <span
          style={{
            color: settingInfoStore.DarkTheme()
              ? "rgba(255, 255, 255, 0.6)"
              : "rgba(0,0,0,0.6)",
            paddingLeft: "10px",
          }}
        >
          {this.title}
        </span>
      ),
      mask: false,
      class: "aaa",
      closable: this.closed,
      centered: true,
      icon: this.icon,
      content: () => {
        return this.content;
      },
      onCancel: () => {
        if (this.close) {
          this.close();
        }
      },
      footer: () => {
        return (
          <ActionBtn>
            {this.cancelText !== "" && (
              <Button
                class={"btn"}
                onClick={async () => {
                  if (this.cancelCall) {
                    let booleanPromise = await this.cancelCall();
                    if (booleanPromise) {
                      DestroyModal();
                    }
                    return;
                  }
                  if (this.cancel) {
                    this.cancel();
                  }
                  DestroyModal();
                }}
              >
                {this.cancelText}
              </Button>
            )}
            {this.okText !== "" && (
              <Button class={"btn"} onClick={this.sureAction}>
                {this.okText}
              </Button>
            )}
          </ActionBtn>
        );
      },
    });
  }

  public sureAction = async () => {
    if (this.okCall) {
      let booleanPromise = await this.okCall();
      if (booleanPromise) {
        DestroyModal();
      }
      return;
    }
    if (this.ok) {
      this.ok();
    }
    DestroyModal();
  };

  public destroy = () => {
    if (this.modal) {
      this.modal.destroy();
    }
  };
}

const ShowModal = (modalView: ModalView) => {
  if (modalViewStore !== null) {
    modalViewStore.destroy();
    modalViewStore = null;
  }
  modalViewStore = modalView;
  if (modalViewStore !== null) {
    modalViewStore.show();
  }
};

const DestroyModal = () => {
  if (modalViewStore !== null) {
    modalViewStore.destroy();
    modalViewStore = null;
  }
};

const OkModal = () => {
  if (modalViewStore !== null) {
    modalViewStore.sureAction();
    modalViewStore = null;
  }
};

export { DestroyModal, ModalView, OkModal, ShowModal };
