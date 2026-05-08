import { $cms } from "@jx3box/jx3box-common/js/api";
import axios from "axios";
import { __imgPath } from "@/utils/config";

function getUserInfo(uid) {
    return $cms().get(`/api/cms/user/${uid}/info`, {
        params: {
            nocache: 1,
        },
    });
}

function getDecorationJson() {
    let url = __imgPath + "decoration/index.json";
    return axios.get(url);
}

function getDecoration(params) {
    return $cms().get(`/api/cms/user/decoration`, {
        params,
    });
}

export { getUserInfo, getDecoration, getDecorationJson };
