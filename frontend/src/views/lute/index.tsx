import {defineComponent} from "vue";
import styled from "vue3-styled-components";

export default defineComponent({
    name: 'Lute',
    setup() {

        const Container = styled.div`
            background-color: #242424;
            width: 100%;
            height: 100%;
            color: white;
            padding: 30px;
            font-size: 17px;
            animation: none !important;
        `

        return () => (
            <Container autocorrect="off" contenteditable={true}>
                <p><strong>Demo</strong></p>
            </Container>
        );
    },
});
