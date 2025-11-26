import wx from "weixin-js-sdk";
import { __Links, __cdn, __Root } from "@/utils/config";

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

export function wxGoLogin() {
    if (!isInMiniprogramWebview()) {
        // 不在小程序中的时候回退操作使用location跳转
        const login_url = __Links.account.login + "?redirect=" + location.href;
        location.href = login_url;
    }
    wx.miniProgram.navigateTo({
        url: `/pages/login/index?redirect=/pages/webview/webview&query=${JSON.stringify({ path: location.pathname })}`,
    });
}
