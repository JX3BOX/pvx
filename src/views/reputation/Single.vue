<template>
    <div class="m-pvx-reputation-wrapper m-pvx-reputation-single-wrapper">
        <SinglePc
            v-if="!isRobot"
            :reputation="reputation"
            :achievementId="achievementId"
            :showPath="showPath"
            :stageList="stageList"
            :pageLen="pageLen"
            @stage-change="handleStageChange"
        />
        <SingleRobot
            v-else-if="isRobot"
            :reputation="reputation"
            :achievementId="achievementId"
            :showPath="showPath"
            :id="id"
        />
    </div>
</template>

<script>
import SinglePc from "./SinglePc.vue";
import SingleRobot from "./SingleRobot.vue";
import { getInfo } from "@/service/reputation";
import { getReputationIcon, getLevelDesc, LOST_RESPECT_UNAVAILABLE } from "@/utils/reputation";

export default {
    name: "reputationSingle",
    props: ["isRobot", "sourceId"],
    components: {
        SinglePc,
        SingleRobot,
    },
    data() {
        return {
            reputation: {
                dwForceID: -1,
                szName: "",
                szDesc: "",
            },
            loading: false,
            stage: -1,
            currentPage: 1,
            pageLen: 0,
            stageList: [],
            LOST_RESPECT_UNAVAILABLE,
        };
    },
    computed: {
        id() {
            return parseInt(this.$route.params.id) || this.sourceId;
        },
        client() {
            return this.$store.state.client;
        },
        achievementId() {
            return this.reputation.achievement?.[0]?.ID;
        },
        showReward() {
            return this.reputation.RewardItems;
        },
        showPath() {
            return Boolean(this.reputation.gainList?.length);
        },
    },
    methods: {
        getReputationIcon,
        handleStageChange(stage) {
            this.stage = stage;
            this.currentPage = 1;
            this.stageList = [];
            const reputation = this.reputation;
            const gainList = reputation.gainList;
            if (gainList && gainList.length && gainList[stage]) {
                const toID = gainList[stage].toID;
                const items = reputation.RewardItems[toID] || [];
                const base = 48;
                if (items.length > base) {
                    const len = Math.ceil(items.length / base);
                    this.pageLen = len;
                    for (let i = 0; i < len; i++) {
                        this.stageList.push(items.slice(base * i, base * (i + 1)));
                    }
                } else {
                    this.stageList = [items];
                }
            }
        },
        getData() {
            this.loading = true;
            getInfo({
                id: this.id,
                client: this.client,
            })
                .then((res) => {
                    const data = res.data;
                    data.szDesc = data.szDesc.replace(/\\n/g, "<br>");
                    data.gainList = data.GainDesc
                        ? data.GainDesc.map((item) => ({
                            fromID: Number(item.from),
                            toID: Number(item.to),
                            from: getLevelDesc(item.from),
                            to: getLevelDesc(item.to),
                            desc: item.desc,
                        }))
                        : [];
                    data.points = [
                        {
                            mapId: data.Guides?.[0]?.map || data.szMapIDs,
                            guides: data.Guides && data.Guides.length && data.Guides[0],
                        },
                    ];
                    if (data?.Guides?.[0]?.positions?.every((item) => item === 0)) {
                        data.hiddenMap = true;
                    }
                    this.reputation = data;
                    document.title = this.reputation?.szName + this.$t("pages.common.appendTitle");
                })
                .finally(() => {
                    this.loading = false;
                });
        },
    },
    watch: {
        id: {
            immediate: true,
            handler(val) {
                val && this.getData();
            },
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/reputation/single.less";
</style>
