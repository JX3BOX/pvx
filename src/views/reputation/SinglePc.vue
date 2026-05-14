<template>
    <div class="m-pvx-reputation-single m-single-wrapper">
        <div class="back-wrap m-navigation">
            <div class="u-pvx-reputation-goback" @click="goBack">返回列表</div>
            <div class="u-back-right">
                <PvxRobotTip v-if="!isRobot" type-name="声望" :reply="reputation.szName"></PvxRobotTip>
                <PvxSingleAdminDrop></PvxSingleAdminDrop>
            </div>
        </div>
        <div class="m-pvx-reputation-content" v-if="reputation">
            <div class="m-pvx-reputation-info">
                <div class="m-pvx-reputation-content-block m-pvx-reputation-content-block--info">
                    <div class="u-pvx-reputation-title">
                        {{ reputation.szName }}
                        <span>ID:{{ reputation.dwForceID }}</span>
                    </div>
                    <div class="u-pvx-reputation-detail">
                        <div class="u-pvx-reputation-sub-title">
                            <img src="@/assets/img/reputation/reputation_title.svg" width="15" svg-inline />
                            介绍
                        </div>
                        <div class="u-pvx-reputation-desc-text" v-html="reputation.szDesc"></div>
                        <template v-if="reputation.szMapNames && reputation.szMapNames.length">
                            <div class="u-pvx-reputation-sub-title">
                                <img src="@/assets/img/reputation/reputation_map.svg" width="15" svg-inline />
                                声望地图
                            </div>
                            <div class="u-pvx-reputation-desc-text">{{ reputation.szMapNames?.[0] }}</div>
                        </template>
                        <template v-if="reputation.GroupName">
                            <div class="u-pvx-reputation-sub-title">
                                <img src="@/assets/img/reputation/reputation_title.svg" width="15" svg-inline />
                                势力类型
                            </div>
                            <div class="u-pvx-reputation-desc-text">{{ reputation.GroupName }}</div>
                        </template>
                        <div class="u-pvx-reputation-sub-title">
                            <img src="@/assets/img/reputation/reputation_path.svg" width="15" svg-inline />
                            遗失的尊敬
                        </div>
                        <div class="u-pvx-reputation-desc-text">
                            {{ reputationPath || LOST_RESPECT_UNAVAILABLE }}
                        </div>
                    </div>
                </div>
                <div class="m-pvx-reputation-content-block m-pvx-reputation-servant">
                    <div class="u-pvx-reputation-img">
                        <img v-if="reputation.servant && reputation.servant.szImagePath"
                            :src="getReputationIcon(reputation.servant.szImagePath, 'partner')"
                            @error="replaceByDefault" />
                        <img v-else src="@/assets/img/reputation/sw-null.jpg" />
                    </div>
                    <div class="u-pvx-reputation-detail" v-if="reputation.servant">
                        <div class="u-pvx-reputation-sub-title u-pvx-reputation-sub-name">
                            {{ reputation.servant && reputation.servant.szNpcName }}
                        </div>
                        <div class="u-pvx-reputation-desc-text" v-html="reputation.servant.szDescBrief"></div>
                        <div class="u-pvx-reputation-desc-text"
                            v-html="reputation.servant.szDescPersonality.replace(/\\n/g, '<br>')"></div>
                        <div class="u-pvx-reputation-sub-title">
                            <img src="@/assets/img/reputation/reputation_title2.svg" width="15" svg-inline />
                            知交祝福
                        </div>
                        <div class="u-pvx-reputation-desc-text">
                            <span>{{ reputation.servant.szBuffName }}</span>
                            {{ reputation.servant.szBuffDesc }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="m-pvx-reputation-map-wrapper" v-if="
                reputation.szMapNames &&
                reputation.szMapNames.length &&
                reputation.Guides &&
                reputation.Guides.length &&
                !reputation.hiddenMap
            ">
                <div class="u-pvx-reputation-title">
                    声望商人
                    <span>{{ reputation.Guides?.[0]?.npcName }}</span>
                </div>
                <div class="map-content">
                    <reputation-map ref="map" :name="reputation.szMapNames?.[0]" :list="reputation.points" />
                </div>
            </div>
        </div>
        <div v-if="showPath" class="m-pvx-reputation-reward">
            <div class="u-pvx-reputation-title">声望奖励</div>
            <div class="m-pvx-reputation-reward-content">
                <div class="m-pvx-reputation-reward-desc">
                    <div class="item" :class="{ active: stage === index }"
                        v-for="(item, index) in reputation.gainList" :key="index" @click="stage = index">
                        <div class="u-pvx-reputation-from-to">
                            {{ item.from }}<i class="el-icon-caret-right"></i>{{ item.to }}
                        </div>
                        <div class="u-pvx-reputation-desc">
                            <div class="u-pvx-reputation-desc-title">提升方式：</div>
                            <div class="u-pvx-reputation-desc-content">{{ item.desc }}</div>
                        </div>
                    </div>
                </div>
                <div v-if="reputation.gainList" class="m-pvx-reputation-stage-reward" :class="{ active: stage !== -1 }">
                    <div class="u-pvx-reputation-stage-title">
                        <span>阶段奖励（{{
                            stage === -1 ? reputation.gainList?.[0]?.from : reputation.gainList[stage].to
                        }}）</span>
                        <div class="u-pvx-reputation-page-list" v-if="stageList.length && stageList?.[0]?.length">
                            <div class="u-pvx-reputation-page-item" :class="page === currentPage && 'active'"
                                v-for="page in pageLen" :key="page" @click="currentPage = page">
                                {{ page }}
                            </div>
                        </div>
                    </div>
                    <template v-if="stageList.length && stageList?.[0]?.length">
                        <div class="list">
                            <item-icon v-for="reward in stageList[currentPage - 1]" :key="reward"
                                :item_id="reward" :onlyIcon="true" :size="36" class="u-item-icon"></item-icon>
                        </div>
                    </template>
                    <div v-else class="u-pvx-reputation-no-data">无</div>
                </div>
            </div>
        </div>
        <pvx-user :id="achievementId" name="声望" type="achievement"></pvx-user>
    </div>
</template>

<script>
import PvxUser from "@/components/PvxUser.vue";
import reputationMap from "@/components/reputation/ReputationMap.vue";
import ItemIcon from "@/components/common/item_icon.vue";
import PvxSingleAdminDrop from "@/components/common/PvxSingleAdminDrop.vue";
import PvxRobotTip from "@/components/common/PvxRobotTip.vue";
import { getReputationIcon, getReputationPath, LOST_RESPECT_UNAVAILABLE } from "@/utils/reputation";

export default {
    name: "SinglePc",
    props: {
        reputation: { type: Object, required: true },
        achievementId: { type: Number, default: null },
        showPath: { type: Boolean, default: false },
        stageList: { type: Array, default: () => [] },
        pageLen: { type: Number, default: 0 },
        isRobot: { type: Boolean, default: false },
    },
    components: {
        reputationMap,
        ItemIcon,
        PvxUser,
        PvxSingleAdminDrop,
        PvxRobotTip,
    },
    data() {
        return {
            stage: -1,
            currentPage: 1,
            LOST_RESPECT_UNAVAILABLE,
        };
    },
    computed: {
        reputationPath() {
            return getReputationPath(this.reputation.szName);
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
        goBack() {
            this.$router.push({ name: "reputation" });
        },
        replaceByDefault(e) {
            e.target.src = require("@/assets/img/reputation/sw-null.jpg");
        },
        handleTabClick(tab) {
            if (tab.name == "map") {
                setTimeout(() => {
                    this.$refs.map && this.$refs.map.updateSize();
                }, 100);
            }
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/reputation/single.less";
</style>
