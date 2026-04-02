<template>
    <div class="m-server">
        <div v-if="uid && favList.length" class="m-fav-list">
            <h2 class="u-title">我的关注</h2>
            <div class="m-server-list">
                <ServerItem
                    v-for="server in favList"
                    :key="server.server_name"
                    :server="server"
                    @clickServer="clickServer"
                ></ServerItem>
            </div>
        </div>
        <div class="m-zone-list" v-for="zone in zones" :key="zone">
            <h2 class="u-title">{{ zone }}</h2>
            <div class="m-server-list">
                <ServerItem
                    v-for="server in serverData[zone]"
                    :key="server.server_name"
                    :server="server"
                    @clickServer="clickServer"
                ></ServerItem>
            </div>
        </div>
    </div>
</template>

<script>
import { setMyFocusServers } from "@/service/pvg/server.js";
import ServerItem from "./server/ServerItem.vue";
import { cloneDeep } from "lodash";
export default {
    name: "Server",
    components: {
        ServerItem,
    },
    data() {
        return {
            serverData: {},
        };
    },
    computed: {
        zones() {
            return Object.keys(this.serverData);
        },
        uid() {
            return this.$store.state.uid;
        },
        serverList() {
            return this.$store.state.serverList;
        },
        favList() {
            return this.$store.state.favList;
        },
    },
    watch: {
        serverList: {
            immediate: true,
            handler(serverList) {
                this.sortServer(serverList);
            },
        },
    },
    methods: {
        // 点击收藏服务器和取消服务器收藏
        clickServer(server) { 
            if (this.uid) {
                let list = new Set(this.favList);
                let fav = [];
                list.has(server) ? list.delete(server) : list.add(server);
                for (let key of list.keys()) {
                    fav.push(key);
                } 
                this.$store.commit("setFavList", fav);
                this.setSavedServers();
            }
        },

        // 将获取的服务器分类
        sortServer(list) {
            const obj = {};
            const sortList = cloneDeep(list).reverse();
            sortList.forEach((item) => {
                if (obj[item.zone_name]) {
                    obj[item.zone_name].push(item);
                } else {
                    obj[item.zone_name] = [item];
                }
            });
            this.serverData = obj;
        },

        //登录状态存服务器，未登录跳转
        setSavedServers() {
            if (this.uid) {
                let list = this.favList.map((el) => el.main_server);

                setMyFocusServers(list.join(","))
                    .then((data) => {
                        console.log(data);
                    })
                    .catch((e) => {
                        console.log(e);
                    });
            } else {
                return this.$store.dispatch("toLogin");
            }
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/pvg/gonggao/server.less";
</style>
