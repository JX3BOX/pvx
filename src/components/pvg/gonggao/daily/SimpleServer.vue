<template>
    <div class="m-simple-server">
        <div class="m-my-server">
            <div class="m-server-header">
                <div class="u-server-title">常用</div>
                <div class="m-status">
                    <div class="u-status is-open">良好</div>
                    <div class="u-status is-busy">繁忙</div>
                    <div class="u-status is-full-load">爆满</div>
                    <div class="u-status">维护</div>
                </div>
            </div>
            <div class="m-fav-list">
                <div class="m-server-item" v-for="item in list" :key="item.main_server">
                    <div class="u-name">{{ item.main_server }}</div>
                    <div class="u-zone">{{ item.zone_name }}</div>
                    <div class="u-status" :class="item.connect_state_class"></div>
                </div>
            </div>
        </div>
        <div class="m-all-servers">
            <div class="u-server-title">全部服务器</div>
            <div class="m-server-list">
                <div class="m-server-item" v-for="item in serverList" :key="item.main_server">
                    <el-tooltip :class="{ on: item.connect_state }" effect="dark" :content="item.main_server">
                        <div class="u-status" :class="item.connect_state_class"></div>
                    </el-tooltip>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import dayjs from "@/utils/day";
export default {
    name: "SimpleServer",
    data() {
        return {};
    },
    computed: {
        serverList() {
            return this.$store.state.serverList;
        },
        favList() {
            return this.$store.state.favList;
        },
        uid() {
            return ~~this.$store.state.uid;
        },
        isOrigin() {
            return location.href.includes("origin");
        },
        myServer() {
            // 当前服务器
            const defaultServer = this.isOrigin ? "缘起稻香" : "梦江南";
            const defaultServerObj = {
                main_server: defaultServer,
                server_name: defaultServer,
                ip_address: "",
                maintain_time: "",
                heat: "6",
                connect_state_name: "良好",
                connect_state_class: "is-open",
            };
            if (this.uid) {
                const myServer =
                    this.serverList.find((item) => item.main_server === this.$store.state.server) || defaultServerObj;
                return myServer;
            } else {
                return this.serverList.find((item) => item.main_server === defaultServer) || defaultServerObj;
            }
        },
        list() {
            // 收藏的服务器
            let list = [];
            if (this.serverList.length) {
                const favList = this.favList.filter((item) => item.main_server !== this.$store.state.server);
                const clientServerList = this.isOrigin
                    ? this.serverList.filter((item) => item.zone_name == "缘起大区")
                    : this.serverList.filter((item) => item.main_server !== this.$store.state.server);
                const serverList = clientServerList.filter((item) => item.main_server !== this.myServer?.main_server);
                if (this.uid && favList.length > 3) {
                    list = favList.splice(0, 3);
                } else {
                    const len = favList.length;
                    const favKeys = favList.map((item) => item.main_server);
                    const remainServerList = serverList.filter((item) => !favKeys.includes(item.main_server));
                    list = favList.concat(remainServerList.splice(0, 3 - len));
                }
            }
            return [this.myServer].concat(list);
        },
    },
    watch: {
        myServer: {
            immediate: true,
            deep: true,
            handler(myServer) {
                if (!this.uid) {
                    this.$store.commit("setServer", myServer?.main_server);
                }
            },
        },
    },
    methods: {
        formateTime(time) {
            return dayjs.tz(time).format("YYYY-MM-DD HH:mm:ss");
        },
    },
    created() {
        if (this.uid) {
            this.$store.dispatch("getMyServer");
        }
    },
};
</script>

<style lang="less"></style>
