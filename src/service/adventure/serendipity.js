import { $cms, $next, axios } from "@jx3box/jx3box-common/js/https";

function getUserInfo() {
    return $cms().get("/api/cms/user/my/info");
}

function getSerendipity(params) {
    const __pull = "https://pull.j3cx.com/";
    return axios.get("/api/serendipity", {
        baseURL: process.env.NODE_ENV === "production" ? __pull : "/",
        params,
    });
}

export { getUserInfo, getSerendipity };
