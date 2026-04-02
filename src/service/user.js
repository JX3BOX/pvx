import { $cms } from "@jx3box/jx3box-common/js/api";

function getProfile() {
    return $cms({ mute: true })
        .get("/api/cms/user/my/profile")
        .then((res) => {
            return res.data.data;
        });
}

function getMeta(key) {
    return $cms({ mute: true }).get("/api/cms/user/my/meta", {
        params: {
            key: key,
        },
    });
}

function getMyInfo() {
    return $cms()
        .get("/api/cms/user/my/info")
        .then((res) => {
            return res.data.data;
        });
}

function report(data) {
    return $cms().post("/api/cms/system/common/reporter");
}

export { getProfile, getMeta, getMyInfo, report };
