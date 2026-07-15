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

// 安全拦截 JSON.parse，防止 "undefined" 等无效 JSON 字符串导致运行时崩溃。
// 这是兼容第三方依赖的容错分支，不向控制台输出可预期的脏数据告警。
export function installSafeJSONParse() {
    const _original = JSON.parse;
    const unsafeStrings = new Set(["undefined"]);

    JSON.parse = function (text, reviver) {
        if (unsafeStrings.has(text)) {
            return reviver ? _original.call(JSON, "{}", reviver) : {};
        }
        return _original.call(JSON, text, reviver);
    };
}
