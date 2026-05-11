export function cleanInvalidStorage() {
    const invalidValues = ["undefined", "null", ""];
    [sessionStorage, localStorage].forEach((storage) => {
        try {
            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                const val = storage.getItem(key);
                if (invalidValues.includes(val)) {
                    storage.removeItem(key);
                    i--;
                }
            }
        } catch (e) {}
    });
}

// 安全拦截 JSON.parse，防止 "undefined" 等无效 JSON 字符串导致运行时崩溃
// 同时打印调用栈帮助定位写入脏数据的源头
export function installSafeJSONParse() {
    const _original = JSON.parse;
    const unsafeStrings = new Set(["undefined"]);

    JSON.parse = function (text, reviver) {
        if (unsafeStrings.has(text)) {
            console.warn(
                `[safeJSONParse] 拦截到无效 JSON 字符串: "${text}"`,
                "\n调用栈:",
                new Error().stack
            );
            return reviver ? _original.call(JSON, "{}", reviver) : {};
        }
        return _original.call(JSON, text, reviver);
    };
}
