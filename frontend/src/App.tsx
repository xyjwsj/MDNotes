import {defineComponent} from 'vue';
import {RouterView} from "vue-router";
import styled from "vue3-styled-components";

export default defineComponent({
    setup() {
        const RootView = styled.div`
            width: 100vw;
            height: 850px;
            position: relative; /* 设置相对定位，以便伪元素可以相对于此元素定位 */
            > * {
                position: relative;
                z-index: 2; /* 确保子元素在伪元素之上 */
            }
        `

        return () => (
            <RootView>
                <RouterView/>
            </RootView>
        )
    },
})