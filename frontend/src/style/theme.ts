
// 主题类型定义（推荐）
import {computed, ref, watchEffect} from "vue";
import {settingInfoStore} from "@/store/modules/settings.ts";

export type Theme = {
    colors: {
        toolBackground: string;
        input: string;
        inputPlaceholder: string;
        inputBackground: string;
        action: string;
        actionHover: string;
        otherAction: string;
        otherActionHover: string;
        listBackground: string;
        listShadow: string;
        listItem: string;
        listItemSelectBackground: string;
        listItemHover: string;
        listInput: string;
        listItemSize: string;
        menuItem: string;
        menuItemHover: string;
        popoverBackground: string;
        tagShadow: string;
        dialogIcon: string;
        dialogItem: string;
        dialogItemBackground: string;
        dialogItemHover: string;
        dialogItemHoverShadow: string;
        footer: string;
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
            action: darkMode ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)",
            actionHover: darkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.7)",
            otherAction: darkMode ? 'rgba(0, 0, 0, 0.3)' : 'lightgray',
            otherActionHover: darkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.3)',
            listBackground: darkMode ? "#282828" : "#F5F6F5",
            listShadow: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'gray',
            listItem: darkMode ? "#E5E5E5" : "rgba(48, 48, 45, 1)",
            listItemSelectBackground: darkMode ? "#2E3C51" : "#D1E0F4",
            listItemHover: darkMode ? "#373735" : "#E4E6E5",
            listInput: darkMode ? "rgba(255, 255, 255, 0.9)" : "black",
            listItemSize: darkMode ? "#6D6D6D" : "gray",
            menuItem: darkMode ? "gray" : "rgba(0, 0, 0, 0.4)",
            menuItemHover: darkMode ? "lightgray" : "rgba(0, 0, 0, 0.7)",
            popoverBackground: darkMode ? 'rgba(0, 0, 0, 0.7)' : 'lightgray',
            tagShadow: darkMode ? 'gray' : 'rgba(0, 0, 0, 0.5)',
            dialogIcon: darkMode ? "white" : "black",
            // dialogItem: darkMode ? 'lightgray' : 'rgba(0, 0, 0, 0.7)',
            dialogItem: darkMode ? "rgba(255, 255, 255, 0.6)" : "gray",
            dialogItemBackground: darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.6)",
            dialogItemHover: darkMode ? "white" : "black",
            dialogItemHoverShadow: darkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.4)",
            footer: darkMode ? "rgba(255, 255, 255, 0.4)" : "gray",
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