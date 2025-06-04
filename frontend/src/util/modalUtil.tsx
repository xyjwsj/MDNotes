import {Button, Modal} from "ant-design-vue";
import styled from "vue3-styled-components";
import {InfoCircleOutlined} from "@ant-design/icons-vue";

const ActionBtn = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    margin-top: 10px;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;

    .btn {
        background-color: lightgray;
        border: none;
        color: gray;

        &:hover {
            background-color: white;
            color: black;
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
        this.icon = <InfoCircleOutlined style={{color: 'black'}}/>
    }

    public show() {
        const modal = Modal.confirm({
            width: this.width,
            title: this.title,
            mask: false,
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