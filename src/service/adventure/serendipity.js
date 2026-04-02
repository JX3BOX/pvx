import { $cms, $pull, axios } from "@jx3box/jx3box-common/js/api";

function getUserInfo() {
    return $cms().get("/api/cms/user/my/info");
}

function getSerendipity(params) {
    return $pull().get("/api/serendipity", {
        params,
    });
}

export { getUserInfo, getSerendipity };
