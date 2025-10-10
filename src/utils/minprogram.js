import wx from "weixin-js-sdk";

export function isInMiniprogramWebview() {
    return window && window.__wxjs_environment === "miniprogram";
}

const serializeParams = (params) => {
    return Object.keys(params)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join("&");
};

/**
 * 用于微信小程序的页面跳转,避免在同一个页面中跳转
 */
export function wxNewPage(target) {
    if (!isInMiniprogramWebview()) {
        // 不在小程序中的时候回退操作使用location跳转
        location.href = target;
    }
    const [path, queryString] = target.split("?");

    const query = queryString ? Object.fromEntries(new URLSearchParams(queryString)) : {};

    query.path = path;

    const url = "/pages/webview/webview?" + serializeParams(query);

    wx.miniProgram.navigateTo({
        url,
    });
}
