<template>
    <div class="m-pvx-reputation-robot-header m-pvx__item">
        <div class="m-title">
            <div class="u-title" :class="`u-title__level-${reputation.Quality}`">
                {{ robotTitle }}
            </div>
            <div class="m-meta">
                <div v-if="reputation.szMapNames?.[0]" class="u-meta">{{ reputation.szMapNames?.[0] }}</div>
                <div v-if="reputation.GroupName" class="u-meta">{{ reputation.GroupName }}</div>
                <div class="u-meta">ID: {{ id }}</div>
            </div>
        </div>
        <div class="u-right">
            <img class="u-icon" src="@/assets/img/qqbot/jx3box_qqbot_reputation.svg" />
        </div>
    </div>
    <div class="m-pvx-reputation-robot-info m-pvx__item">
        <div class="u-reputation-logo">
            <img v-if="getBotIcon(reputation.szIconPath)" width="28" :src="getBotIcon(reputation.szIconPath)" />
        </div>
        <div class="u-intro" v-html="reputation.szDesc"></div>
    </div>
    <div v-if="showPath" class="m-pvx-reputation-robot-reward">
        <div class="m-title">
            <div class="u-title">声望奖励</div>
            <span class="u-up">{{ reputationPath || LOST_RESPECT_UNAVAILABLE }}</span>
        </div>
        <div class="m-pvx__item m-pvx-reputation-reward-content">
            <div class="m-pvx-reputation-reward-desc">
                <div class="m-pvx__item item" :class="{ active: stage === index }"
                    v-for="(item, index) in reputation.gainList" :key="index" @click="stage = index">
                    <div class="u-pvx-reputation-from-to">
                        {{ item.to }}
                    </div>
                    <div class="u-pvx-reputation-desc">
                        <div class="u-pvx-reputation-desc-title">提升方式：</div>
                        <div class="u-pvx-reputation-desc-content">{{ item.desc }}</div>
                    </div>
                    <div class="m-reward">
                        <div class="u-pvx-reputation-desc-title">阶段奖励：</div>
                        <div v-if="reputation?.RewardItems?.[item?.toID]?.length" class="list">
                            <item-icon v-for="reward in reputation?.RewardItems?.[item?.toID]" :key="reward"
                                :item_id="reward" class="u-item-icon" :onlyName="true"></item-icon>
                        </div>
                        <div v-else class="u-pvx-reputation-no-data">无</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="m-pvx-reputation-robot-servant m-pvx__item">
        <div class="u-pvx-reputation-img">
            <img v-if="reputation.servant && reputation.servant.szImagePath"
                :src="getReputationIcon(reputation.servant.szImagePath, 'partner')" @error="replaceByDefault" />
            <img v-else src="@/assets/img/reputation/sw-null.jpg" />
        </div>
        <div class="u-pvx-reputation-detail" v-if="reputation.servant">
            <div class="u-pvx-reputation-sub-title u-pvx-reputation-sub-name">
                {{ reputation.servant && reputation.servant.szNpcName }}
            </div>

            <div class="u-pvx-reputation-sub-title u-zf">
                知交祝福
                <span>{{ reputation.servant.szBuffName }}</span>
                {{ reputation.servant.szBuffDesc?.replace("。", "") }}
            </div>
            <div class="u-pvx-reputation-desc-text" v-html="reputation.servant.szDescBrief"></div>
            <div class="u-pvx-reputation-desc-text" v-html="reputation.servant.szDescPersonality.replace(/\\n/g, '<br>')"></div>
        </div>
    </div>
    <pvx-user :id="achievementId" name="声望" type="achievement" :isRobot="true"></pvx-user>
</template>

<script>
import PvxUser from "@/components/PvxUser.vue";
import ItemIcon from "@/components/common/item_icon.vue";
import { getReputationIcon, getBotIcon, getReputationPath, LOST_RESPECT_UNAVAILABLE } from "@/utils/reputation";

export default {
    name: "SingleRobot",
    props: {
        reputation: { type: Object, required: true },
        achievementId: { type: Number, default: null },
        showPath: { type: Boolean, default: false },
        id: { type: Number, required: true },
    },
    components: {
        PvxUser,
        ItemIcon,
    },
    data() {
        return {
            stage: -1,
            LOST_RESPECT_UNAVAILABLE,
        };
    },
    computed: {
        robotTitle() {
            return `声望 · ${this.reputation?.szName || ""}`;
        },
        reputationPath() {
            return getReputationPath(this.reputation.szName);
        },
    },
    methods: {
        getReputationIcon,
        getBotIcon,
        replaceByDefault(e) {
            e.target.src = require("@/assets/img/reputation/sw-null.jpg");
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/reputation/single-robot.less";
</style>
