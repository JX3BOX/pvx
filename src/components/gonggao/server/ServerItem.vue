<template>
    <div class="m-server-item hvr-float-shadow" :class="server.connect_state_class">
        <div class="u-server-title">
            <div class="u-name">{{ server.main_server }}</div>
            <div class="u-status">{{ server.connect_state_name }}</div>
        </div>
        <div class="u-server-ip">IP:{{ server.ip_address + ":" + server.ip_port }}</div>
        <div class="u-server-time"><span>最近维护时间:</span>{{ formateTime(server.maintain_time * 1000) }}</div>
        <div class="u-server-fav hvr-icon-push" :class="isSaved && 'is-saved'" @click="favHandle">
            <img class="hvr-icon" svg-inline :src="require(`@/assets/img/gonggao/${isSaved ? 'unfav' : 'fav'}.svg`)" />
        </div>
    </div>
</template>

<script>
import dayjs from "@/utils/day";
export default {
    name: "ServerItem",
    props: {
        server: {
            type: Object,
            required: true,
        },
    },
    computed: {
        favList() {
            return this.$store.state.favList;
        },
        isSaved() {
            return this.favList.filter((item) => item.main_server.indexOf(this.server.main_server) !== -1).length > 0;
        },
    },
    methods: {
        formateTime(time) {
            return dayjs.tz(time).format("YYYY-MM-DD HH:mm:ss");
        },
        favHandle() {
            this.$emit("clickServer", this.server);
        },
    },
};
</script>
