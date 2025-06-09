import {defineComponent, inject, onBeforeMount, onMounted} from "vue";
import styled from "vue3-styled-components";
import {Image} from "ant-design-vue";
import appIcon from '@/assets/png/appicon.png'
import {Start, Trial} from "@/bindings/changeme/handler/systemhandler.ts";

import {useI18n} from "vue-i18n";
import {settingInfoStore} from "@/store/modules/settings.ts";
import router from "@/router";

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

        const showLicense: any = inject('showLicense')

        onMounted(async () => {
            const res = await Trial(false)
            if (res) {
                router.replace({name: 'Home'})
            } else {
                showLicense(() => {
                    debugger
                    setTimeout(() => {
                        router.replace({name: 'Home'})
                    }, 500)
                })
            }
        })

        onBeforeMount(async () => {
            await Start()
        })

        return () => (
            <Container onClick={showLicense}>
                <span class={'title'}>{'MDNote'}</span>
                <Image class={'img'} src={appIcon} preview={false} width={200}></Image>
                <span class={'footer'}>{t("footerTip")}</span>
            </Container>
        )
    }
})