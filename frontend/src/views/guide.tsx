import {defineComponent, onBeforeMount, onMounted, ref} from "vue";
import styled from "vue3-styled-components";
import {Image, Input} from "ant-design-vue";
import appIcon from '@/assets/png/appicon.png'
import {CreateLicense, Start, Trial} from "@/bindings/changeme/handler/systemhandler.ts";

import {useI18n} from "vue-i18n";
import {settingInfoStore} from "@/store/modules/settings.ts";
import router from "@/router";
import {TipError, TipWarning} from "@/util/messageUtil.tsx";
import {ModalView} from "@/util/modalUtil.tsx";

export default defineComponent({
    name: "Guide",
    setup() {
        const { t } = useI18n();

        const Container = styled.div`
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            background-color: ${() => settingInfoStore.DarkTheme() ? 'rgba(0, 0, 0, 0.8)' : 'rgba(193, 251, 240, 0.4)'};
            position: relative;

            @keyframes scaleAnimation {
                0% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.1); /* 放大 10% */
                }
                100% {
                    transform: scale(1);
                }
            }
            
            .title {
                position: absolute;
                top: 220px;
                color: ${() => settingInfoStore.DarkTheme()? 'white' : 'black'};
                font-size: 25px;
                font-weight: bold;
            }
            
            .img {
                border-radius: 20px;
                box-shadow: -5px -5px 80px 30px rgba(193, 251, 240, 0.5);
                animation: scaleAnimation 2s infinite ease-in-out; 
            }
            .footer {
                position: absolute;
                bottom: 180px;
                color: ${() => settingInfoStore.DarkTheme()? 'lightgray' : 'gray'};;
                opacity: 0;
                font-size: 14px;
                z-index: 2;

                animation: fadeIn 1s ease-in forwards;
                animation-delay: 0.3s;
            }

            @keyframes fadeIn {
                to {
                    opacity: 1;
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

        // const showLicense: any = inject('showLicense')

        onMounted(async () => {
            const res = await Trial(false)
            if (res) {
                router.replace({name: 'Home'})
            } else {
                showLicense((res: boolean) => {
                    if (res) {
                        router.replace({name: 'Home'})
                    }
                }, async () => {
                    const res = await Trial(true)
                    if (res) {
                        router.replace({name: 'Home'})
                        return true
                    } else {
                        TipError(t('trialEnd'))
                        return false
                    }
                })
            }
        })

        onBeforeMount(async () => {
            await Start()
        })


        return () => (
            <Container>
                <span class={'title'}>{'MDNote'}</span>
                <Image class={'img'} src={appIcon} preview={false} width={200}></Image>
                <span class={'footer'}>{t("footerTip")}</span>
            </Container>
        )
    }
})