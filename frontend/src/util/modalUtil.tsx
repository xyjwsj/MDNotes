import {Button, Modal} from "ant-design-vue";
import styled from "vue3-styled-components";
import {CloseOutlined, InfoCircleOutlined} from "@ant-design/icons-vue";
import {settingInfoStore} from "@/store/modules/settings.ts";

const ActionBtn = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    margin-top: 10px;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;

    .btn {
        background-color: ${() => settingInfoStore.DarkTheme() ? '#3a383a' : 'lightgray'};
        border: none;
        color: ${() => settingInfoStore.DarkTheme() ? 'lightgray' : 'gray'};

        &:hover {
            background-color: ${() => settingInfoStore.DarkTheme() ? '#4E4B4E' : 'white'};
            color: ${() => settingInfoStore.DarkTheme() ? 'white' : 'black'};;
        }
    }
`;

class ModalView {
    public content: any
    public ok?: () => void
    public cancel?: () => void
    public close?: () => void
    public closed: boolean
    public title: string
    public okText: string
    public cancelText: string
    public width: number
    public icon: any

    constructor() {
        this.title = "删除"
        this.okText = "确定"
        this.cancelText = "取消"
        this.closed = false
        this.width = 300
        this.icon = <InfoCircleOutlined style={{color: settingInfoStore.DarkTheme() ? 'white' : 'black'}}/>
    }

    public show() {
        const modal = Modal.confirm({
            style: {
                backgroundColor: settingInfoStore.DarkTheme() ? '#1E1F22' : 'white',
                color: settingInfoStore.DarkTheme() ? 'white' : 'black',
                borderRadius: '10px',
                boxShadow: '0 0 20px 1px gray'
            },
            closeIcon: <CloseOutlined style={{color: settingInfoStore.DarkTheme() ? 'white' : 'black'}}/>,
            width: this.width,
            title: <span style={{color: settingInfoStore.DarkTheme() ? 'white' : 'black'}}>{this.title}</span>,
            mask: false,
            class: 'aaa',
            closable: this.closed,
            centered: true,
            icon: this.icon,
            content: () => {
                return this.content
            },
            onCancel: () => {
                if (this.close) {
                    this.close()
                }
            },
            footer: () => {
                return <ActionBtn>
                    <Button
                        class={"btn"}
                        onClick={() => {
                            if (this.cancel) {
                                this.cancel()
                            }
                            modal.destroy()
                        }}
                    >
                        {this.cancelText}
                    </Button>
                    <Button
                        class={"btn"}
                        onClick={async () => {
                            if (this.ok) {
                                this.ok()
                            }
                            modal.destroy()
                        }}
                    >
                        {this.okText}
                    </Button>
                </ActionBtn>
            }
        });
    }
}

export {
    ModalView
}