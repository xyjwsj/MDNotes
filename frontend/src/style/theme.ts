// 主题类型定义（推荐）
import {computed, ref, watchEffect} from "vue";
import {settingInfoStore} from "@/store/modules/settings.ts";

export type Theme = {
    colors: {
        // 工具栏背景色
        toolBackground: string;
        // 输入框色
        input: string;
        // 输入框提示颜色
        inputPlaceholder: string;
        // 输入框背景色
        inputBackground: string;
        // 其他按钮栏文本色
        otherAction: string;
        // 其他按钮悬浮文本色
        otherActionHover: string;
        // 标题颜色
        title: string
        // 副标题颜色
        subTitle: string
        // 列表区背景色
        listBackground: string;
        // 列表去阴影色
        listShadow: string;
        // 列表区条目文本色
        listItem: string;
        // 列表区选中条目背景色
        listItemSelectBackground: string;
        // 列表区条目悬浮色
        listItemHover: string;
        // 列表区输入框颜色
        listInput: string;
        // 列表区条目大小文本颜色
        listItemSize: string;
        // 悬浮下拉框背景色
        popoverBackground: string;
        // 工具栏菜单悬浮色
        menuItemHover: string;
        // 工具栏菜单文本色
        menuItem: string;
        // 对话框tag阴影
        tagShadow: string;
        // 对话框图标颜色
        dialogIcon: string;
        // 对话框标题颜色
        dialogTitle: string;
        // 对话框label文本色
        dialogLabelText: string;
        // 对话框label色
        dialogLabel: string;
        // 对话框label背景色
        dialogLabelBackground: string;
        // 对话框条目文本色
        dialogItem: string;
        // 对话框条目背景色
        dialogItemBackground: string;
        // 对话框条目悬浮色值
        dialogItemHover: string;
        // 对话框条目悬浮阴影
        dialogItemHoverShadow: string;
        // 对话框输入框色制
        dialogInput: string;
        // 对话框输入框聚焦色纸
        dialogInputFocus: string;
        // 对话框输入框提示文本色
        dialogInputPlaceholder: string;
        // 对话框输入框背景色
        dialogInputBackground: string;
        // 对话框输入框悬浮文本色
        dialogInputHover: string;
        // 对话框输入框悬浮阴影
        dialogInputHoverShadow: string;
        // 对话框按钮文本色
        dialogBtn: string;
        // 对话框按钮背景色
        dialogBtnBackground: string;
        // 对话框按钮悬浮文本颜色
        dialogBtnHover: string;
        // 对话框按钮悬浮阴影
        dialogBtnHoverShadow: string;
        // 对话框按钮悬浮背景色
        dialogBtnHoverBackground: string;
        // 对话框无数据颜色
        dialogNoData: string;

        icon: string;
        // 列表区底部文本色值
        footer: string;
        // 编辑器背景色
        editorBackground: string;
        // 字符计数器背景色
        counterBackground: string;
        // 编辑去右下角同步文本颜色
        syncInfo: string;
        // 编辑区右下角同步中icon颜色
        syncIng: string;
    };
    fonts: {
        main: string;
    };
};

export const useAppTheme = () => {
    const darkMode = computed(() => settingInfoStore.DarkTheme());
    return computed<Theme>(() => computeThemeColors(darkMode.value));
};

// 公共函数：根据 darkMode 返回完整主题对象
const computeThemeColors = (darkMode: boolean) => {
    return {
        colors: {
            toolBackground: darkMode ? "#282828" : "#e9e9ed",
            input: darkMode ? "#FFFFFF" : "rgba(0, 0, 0, 0.6)",
            inputPlaceholder: darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.4)",
            inputBackground: darkMode ? "#181816" : "#fafafa",
            otherAction: darkMode ? 'rgba(0, 0, 0, 0.3)' : 'lightgray',
            otherActionHover: darkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.3)',
            title: darkMode ? "lightgray" : "gray",
            subTitle: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
            listBackground: darkMode ? "#282828" : "#F5F6F5",
            listShadow: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'gray',
            listItem: darkMode ? "#E5E5E5" : "rgba(48, 48, 45, 1)",
            listItemSelectBackground: darkMode ? "#2E3C51" : "#D1E0F4",
            listItemHover: darkMode ? "#373735" : "#E4E6E5",
            listInput: darkMode ? "rgba(255, 255, 255, 0.9)" : "black",
            listItemSize: darkMode ? "#6D6D6D" : "gray",
            menuItem: darkMode ? "gray" : "rgba(0, 0, 0, 0.4)",
            menuItemHover: darkMode ? "lightgray" : "rgba(0, 0, 0, 0.7)",
            popoverBackground: darkMode ? "#282828" : 'lightgray',
            tagShadow: darkMode ? 'gray' : 'rgba(0, 0, 0, 0.5)',
            dialogIcon: darkMode ? "white" : "black",
            dialogTitle: darkMode ? "rgba(255, 255, 255, 0.8)" : "gray",
            dialogLabelText: darkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)",
            dialogLabel: darkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.8)",
            dialogLabelBackground: darkMode ? "rgba(0, 0, 0, 0.7)" : "lightgray",
            dialogItem: darkMode ? "rgba(255, 255, 255, 0.6)" : "gray",
            dialogItemBackground: darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.6)",
            dialogItemHover: darkMode ? "white" : "black",
            dialogItemHoverShadow: darkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.4)",
            dialogInput: darkMode ? "rgba(255, 255, 255, 0.6)" : "gray",
            dialogInputFocus: darkMode ? "rgba(255, 255, 255, 0.4)" : "white",
            dialogInputPlaceholder: darkMode ? "rgba(255, 255, 255, 0.4)" : "gray",
            dialogInputBackground: darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.7)",
            dialogInputHover: darkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.8)",
            dialogInputHoverShadow: darkMode ? "rgba(255, 255, 255, 0.8)" : "gray",
            dialogBtnBackground: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.6)',
            dialogBtn: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.2)',
            dialogBtnHover: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.5)',
            dialogBtnHoverShadow: darkMode ? "rgba(255, 255, 255, 0.8)" : "gray",
            dialogBtnHoverBackground: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.8)',
            dialogNoData: darkMode ? "white" : "gray",
            icon: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.4)',
            footer: darkMode ? "rgba(255, 255, 255, 0.4)" : "gray",
            editorBackground: darkMode ? '#1D1D1B' : '#FCFCFA',
            counterBackground: darkMode ? "#2B2D30" : "#E0E0E3",
            syncInfo: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'lightgray',
            syncIng: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'gray',
        },
        fonts: {
            main: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
        }
    }
}

export const currentTheme = ref<Theme>(computeThemeColors(false));

watchEffect(() => {
    const darkMode = settingInfoStore.DarkTheme();
    currentTheme.value = computeThemeColors(darkMode);
});