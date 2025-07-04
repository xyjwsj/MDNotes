import Mousetrap from "mousetrap";

const HandleKey = (event: KeyboardEvent) => {
    const modifiers: string[] = [];

    if (event.metaKey || event.ctrlKey) modifiers.push("command");
    if (event.altKey) modifiers.push("alt");
    if (event.shiftKey) modifiers.push("shift");

    let key = event.key.toLowerCase();

    // 特殊键映射
    const keyMap: Record<string, string> = {
        " ": "space",
        arrowleft: "left",
        arrowright: "right",
        arrowup: "up",
        arrowdown: "down"
    };

    key = keyMap[key] || key;

    // 拼接快捷键字符串，如 'command+shift+s'
    const shortcut = [...modifiers, key].join("+");
    console.log('监听事件', shortcut)
    Mousetrap.trigger(shortcut)
}

export {
    HandleKey
}