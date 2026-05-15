<template>
    <div class="m-pvx-reputation-single--miniprogram">
        <SuspendCommon :btnOptions="{ showHome: true }" :drawerOptions="{
            hideType: hideType,
            title: reputation.szName,
            postType: 'reputation',
            id: id,
        }" v-if="$route.query?.disabled != 'true'">
            <template #default>
                <div class="m-suspend-btn">
                    <div class="u-btn-item line" @click="showForm = true">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/switch_touchbar.svg" svg-inline />
                        导航
                    </div>
                </div>
            </template>
        </SuspendCommon>
        <el-drawer v-model="showForm" direction="btt" :with-header="false" :modal-append-to-body="false"
            append-to-body class="c-drawer">
            <div class="m-pvx-reputation-tabs--miniprogram">
                <div class="u-tab" v-for="item in navigation" :key="item.value" @click="switchNav(item)">
                    {{ item.label }}
                </div>
            </div>
        </el-drawer>
        <div class="m-pvx-reputation-content" v-if="reputation" id="info">
            <div class="m-pvx-reputation-info">
                <div class="m-pvx-reputation-content-block m-pvx-reputation-content-block--info">
                    <div class="u-pvx-reputation-title">
                        {{ reputation.szName }}
                        <span>ID:{{ reputation.dwForceID }}</span>
                    </div>
                    <div class="m-pvx-reputation-detail--miniprogram">
                        <div class="u-item">
                            <div class="u-label">介绍</div>
                            <div class="u-val" v-html="reputation.szDesc"></div>
                        </div>
                        <div class="u-item u-user" v-if="reputation.servant" @click="servantVisible = true">
                            <div class="u-label">声望知交</div>
                            <div class="u-val">
                                {{ reputation.servant?.szNpcName || "-" }}
                                <img class="u-icon" src="@/assets/img/reputation/user.svg" svg-inline width="14" />
                            </div>
                        </div>
                        <el-row>
                            <el-col :span="12">
                                <div class="u-item u-map" @click="mapVisible = true">
                                    <div class="u-label">声望地图</div>
                                    <div class="u-val" :class="{
                                        'no-map': !hasMap,
                                    }">
                                        {{ reputation?.szMapNames?.[0] || "-" }}
                                        <img v-if="hasMap" class="u-icon" src="@/assets/img/reputation/map.svg"
                                            svg-inline width="14" />
                                    </div>
                                </div>
                            </el-col>
                            <el-col :span="12">
                                <div class="u-item">
                                    <div class="u-label">势力类型</div>
                                    <div class="u-val">
                                        {{ reputation.GroupName || "-" }}
                                    </div>
                                </div>
                            </el-col>
                        </el-row>
                        <div class="u-item">
                            <div class="u-label">遗失的尊敬</div>
                            <div class="u-val">
                                {{ reputationPath || LOST_RESPECT_UNAVAILABLE }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="m-pvx-reputation-reward--miniprogram" v-if="reputation.gainList" id="award">
            <el-scrollbar>
                <div class="m-pvx-reputation-reward-tabs">
                    <div class="u-reward-tab" :class="{ active: stage === index }"
                        v-for="(item, index) in rewardList" :key="index" @click="stage = index">
                        {{ item.label }}
                    </div>
                </div>
            </el-scrollbar>
            <div class="m-pvx-reputation-reward-content">
                <div class="u-item">
                    <div class="u-label">提升方式</div>
                    <div class="u-value">{{ rewardList[stage]?.desc }}</div>
                </div>
                <div class="u-item">
                    <div class="u-label">阶段奖励（{{ rewardList[stage]?.label }}）</div>
                    <div class="u-value m-pvx-reputation-reward-content" v-if="stageList.length && stageList?.[0]?.length">
                        <div class="list">
                            <item-icon v-for="reward in stageListMini" :key="reward" :item_id="reward"
                                :onlyIcon="true" :size="36" :isLink="false" class="u-item-icon"></item-icon>
                        </div>
                        <div class="u-more" v-if="pageLen && pageLen > currentPage" @click="loadMore">加载更多</div>
                    </div>
                    <div v-else class="u-pvx-reputation-no-data">无奖励</div>
                </div>
            </div>
        </div>
        <div id="strategy">
            <PvxUserMiniprogram :id="achievementId" name="声望" type="achievement"></PvxUserMiniprogram>
        </div>
        <el-drawer :title="`${reputation.servant && reputation.servant.szNpcName} - 声望知交`" v-model="servantVisible"
            direction="btt" append-to-body :show-close="false" class="bottom-drawer">
            <div class="m-pvx-reputation-servant-drawer" v-if="reputation.servant">
                <img v-if="reputation.servant && reputation.servant.szImagePath"
                    :src="getReputationIcon(reputation.servant.szImagePath, 'partner')" />
                <img v-else src="@/assets/img/reputation/sw-null.jpg" />
                <div class="m-pvx-reputation-buff">
                    <div>知交祝福</div>
                    <div class="u-pvx-reputation-desc-text">
                        <span>{{ reputation.servant.szBuffName }}</span>
                        {{ reputation.servant.szBuffDesc }}
                    </div>
                </div>
                <div class="u-pvx-reputation-desc-text" v-html="reputation.servant.szDescPersonality.replace(/\\n/g, '<br>')"></div>
            </div>
        </el-drawer>
        <el-drawer :title="`${reputation.szMapNames?.[0]} - ${reputation.Guides?.[0]?.npcName} - 声望商人位置`"
            v-model="mapVisible" direction="btt" append-to-body :show-close="false" class="bottom-drawer">
            <div class="m-pvx-reputation-map-drawer">
                <reputation-map ref="map" :name="reputation.szMapNames?.[0]" :list="reputation.points" />
            </div>
        </el-drawer>
    </div>
</template>

<script>
import SuspendCommon from "@jx3box/jx3box-ui/src/SuspendCommon";
import PvxUserMiniprogram from "@/components/PvxUserMiniprogram.vue";
import reputationMap from "@/components/reputation/ReputationMap.vue";
import ItemIcon from "@/components/common/item_icon.vue";
import { getReputationIcon, getReputationPath, LOST_RESPECT_UNAVAILABLE } from "@/utils/reputation";

export default {
    name: "SingleMiniprogram",
    props: {
        reputation: { type: Object, required: true },
        achievementId: { type: Number, default: null },
        showPath: { type: Boolean, default: false },
        stageList: { type: Array, default: () => [] },
        pageLen: { type: Number, default: 0 },
        id: { type: Number, required: true },
    },
    components: {
        reputationMap,
        ItemIcon,
        PvxUserMiniprogram,
        SuspendCommon,
    },
    data() {
        return {
            hideType: ["report", "rss", "search", "user"],
            servantVisible: false,
            mapVisible: false,
            showForm: false,
            stage: 0,
            currentPage: 1,
            stageListMini: [],
            rewardMap: {
                3: "中立",
                4: "友好",
                5: "亲密",
                6: "敬重",
                7: "尊敬",
                8: "钦佩",
            },
            navigation: [
                { label: "声望信息", value: 1, id: "info" },
                { label: "声望奖励", value: 2, id: "award" },
                { label: "声望攻略", value: 3, id: "strategy" },
            ],
            LOST_RESPECT_UNAVAILABLE,
        };
    },
    computed: {
        hasMap() {
            return (
                this.reputation.szMapNames &&
                this.reputation.szMapNames.length &&
                this.reputation.Guides &&
                this.reputation.Guides.length &&
                !this.reputation.hiddenMap
            );
        },
        reputationPath() {
            return getReputationPath(this.reputation.szName);
        },
        rewardList() {
            return Object.entries(this.rewardMap)
                .map(([key, val]) => {
                    const desc = this.reputation?.GainDesc?.find((item) => item.to == key)?.desc;
                    return {
                        label: val,
                        value: key,
                        desc,
                        list: this.reputation.RewardItems?.[key],
                    };
                })
                .filter((item) => item.desc);
        },
    },
    watch: {
        stage: {
            immediate: true,
            handler(stage) {
                this.currentPage = 1;
                this.$emit("stage-change", stage);
            },
        },
    },
    methods: {
        getReputationIcon,
        switchNav(item) {
            const element = document.getElementById(item.id);
            if (element) {
                this.showForm = false;
                element.scrollIntoView({ behavior: "smooth" });
            }
        },
        loadMore() {
            if (this.stageList[this.currentPage]) {
                this.stageListMini = this.stageListMini.concat(this.stageList[this.currentPage]);
                this.currentPage++;
            }
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/reputation/miniprogram/single.less";
@import "~@/assets/css/miniprogram.less";
@import "~@/assets/css/common/drawer.less";
</style>
