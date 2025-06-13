import wx from "weixin-js-sdk";

const serializeParams = (params) => {
    return Object.keys(params)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join("&");
};

/**
 * 用于微信小程序的页面跳转,避免在同一个页面中跳转
 */
export function wxNewPage(target) {
    const [path, queryString] = target.split("?");

    const query = queryString ? Object.fromEntries(new URLSearchParams(queryString)) : {};

    query.path = path;

    const url = "/pages/webview/webview?" + serializeParams(query);

    wx.miniProgram.navigateTo({
        url,
    });
}
