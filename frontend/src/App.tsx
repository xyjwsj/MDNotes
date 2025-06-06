import {defineComponent, onMounted} from 'vue';
import {RouterView} from "vue-router";
import styled from "vue3-styled-components";
import {useI18n} from "vue-i18n";
import {settingInfoStore} from "@/store/modules/settings.ts";

export default defineComponent({
    setup() {

        const { locale} = useI18n();

        const RootView = styled.div`
            width: 100vw;
            height: 850px;
            position: relative; /* 设置相对定位，以便伪元素可以相对于此元素定位 */
            > * {
                position: relative;
                z-index: 2; /* 确保子元素在伪元素之上 */
            }
        `

        onMounted(() => {
            locale.value = settingInfoStore.getState().lang || 'zh'
        })

        return () => (
            <RootView>
                <RouterView/>
            </RootView>
        )
    },
})