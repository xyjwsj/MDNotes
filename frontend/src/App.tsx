import {defineComponent, onMounted, provide, ref} from 'vue';
import {RouterView} from "vue-router";
import styled from "vue3-styled-components";
import {useI18n} from "vue-i18n";
import {settingInfoStore} from "@/store/modules/settings.ts";
import {ModalView} from "@/util/modalUtil.tsx";
import {TipError, TipWarning} from "@/util/messageUtil.tsx";
import {CreateLicense} from "@/bindings/changeme/handler/systemhandler.ts";
import {Input} from "ant-design-vue";

export default defineComponent({
    setup() {

        const { t, locale} = useI18n();

        const RootView = styled.div`
            width: 100vw;
            height: 850px;
            position: relative; /* 设置相对定位，以便伪元素可以相对于此元素定位 */
            > * {
                position: relative;
                z-index: 2; /* 确保子元素在伪元素之上 */
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
        `

        const InputView = styled(Input)`
            background-color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.6)'};
            margin: 5px 0;
            color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.8)' : 'gray'};

            .ant-input {
                &::placeholder {
                    color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.4)' : 'gray'};
                }
            }

            &:hover {
                background-color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.4)' : '#fafafa'};
            }

            &:focus {
                background-color: ${() => settingInfoStore.DarkTheme() ? 'rgba(255, 255, 255, 0.4)' : 'white'};;
            }
        `;

        onMounted(() => {
            locale.value = settingInfoStore.getState().lang || 'zh'

        })

        const showLicense = (ok?: (res: boolean) => void, cancel?: () => Promise<boolean>) => {

            const license = ref("")

            const modalView = new ModalView()
            modalView.width = '50%'
            modalView.title = t('license')
            modalView.okText = t('validate')
            modalView.cancelText = t('trial')
            modalView.closed = true
            modalView.content = <div>
                <InputView
                    class={"inputC"}
                    bordered={false}
                    placeholder={t('input') + t('license')}
                    defaultValue={license.value}
                    onChange={(e) => (license.value = e.target.value!)}
                ></InputView>
                <span style={{
                    color: settingInfoStore.DarkTheme()?"lightgray":"gray",
                }}>{`${t('licenseTip')}：xyjwsj`}</span>
            </div>
            modalView.cancelCall = async () => {
                if (cancel) {
                    return await cancel()
                }
                return true
            }
            modalView.okCall = async () => {
                if (license.value === "") {
                    TipWarning(t('input') + t('license'))
                    return false
                }
                let createLicense = await CreateLicense(license.value);
                if(createLicense) {
                    TipWarning(t('success'))
                } else {
                    TipError(t('licenseIncorrect'))
                }
                if (ok) {
                    ok(createLicense)
                }
                return createLicense
            }

            modalView.show()
        }

        provide('showLicense', showLicense)

        return () => (
            <RootView>
                <RouterView/>
            </RootView>
        )
    },
})