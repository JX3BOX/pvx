export function deleteNull(obj) {
    if (Object.prototype.toString.call(obj) === "[object Object]") {
        for (const key in obj) {
            if ([undefined, null, ""].includes(obj[key])) {
                delete obj[key];
            }
        }
        return obj;
    } else {
        return obj;
    }
}

export function isPhone() {
    let mobile = navigator.userAgent.match(
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    );
    return mobile !== null;
}

// 多字段排序 - 数值
export function sortBy(filed1, filed2) {
    return function (a, b) {
        if (a[filed1] === b[filed1]) {
            return a[filed2] - b[filed2];
        }
        return a[filed1] - b[filed1];
    };
}
