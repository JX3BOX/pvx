import User from "@jx3box/jx3box-common/js/user";
import axios from "axios";
import { __spider2 } from "@jx3box/jx3box-common/data/jx3box.json";
import { $cms, $https } from "@jx3box/jx3box-common/js/https";
const $spider = axios.create({
    // __spider2
    baseURL: __spider2
});
function setFlowerServer(server) {
    localStorage && localStorage.setItem("flower_server", server);
}

function getProfile() {
    return $cms()
        .get("/api/cms/user/my/profile")
        .then((res) => {
            return res.data.data;
        });
}

function getTempServer(type) {
    return localStorage && localStorage.getItem(type);
}

async function getServer(type) {
    let isLogin = User.isLogin();
    // 1.如果已登录
    if (isLogin) {
        // 1.1尝试获取资料设定服务器
        return getProfile()
            .then((data) => {
                return data.server || data.jx3_server;
            })
            .then((server) => {
                if (server) {
                    return server;
                } else {
                    // 1.2尝试获取本地搜索记录
                    return getTempServer(type);
                }
            });
    } else {
        // 2.如果未登录，直接尝试获取本地搜索记录
        return getTempServer();
    }
}

function getMyFocusServers() {
    return $cms()
        .get(`api/cms/user/my/meta`, {
            params: {
                key: "jx3_servers",
            },
        })
        .then((res) => {
            return res.data.data;
        });
}

function setMyFocusServers(data) {
    return $cms()
        .post(
            `api/cms/user/my/meta`,
            {
                val: data,
            },
            {
                params: {
                    key: "jx3_servers",
                },
            }
        )
        .then((res) => {
            return res.data.data;
        });
}

function getAllServers() {
    return $spider.get("/api/spider/server/server_state");
}

export { setFlowerServer, getServer, getProfile, getTempServer, getMyFocusServers, setMyFocusServers, getAllServers };
