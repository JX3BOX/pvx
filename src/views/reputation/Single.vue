<template>
    <div class="m-reputation-wrapper m-single-wrapper">
        <div class="back-wrap">
            <el-button @click="goBack">返回列表</el-button>
        </div>
        <div class="m-reputation-content" v-if="reputation">
            <div class="info-wrapper">
                <div class="m-content m-content-info">
                    <div class="title">
                        {{ reputation.szName }}
                        <span>ID:{{ reputation.dwForceID }}</span>
                    </div>
                    <div class="detail-wrap">
                        <div class="sub-title">
                            <img src="@/assets/img/reputation/reputation_title.svg" width="15" svg-inline />
                            介绍
                        </div>
                        <div class="u-desc" v-html="reputation.szDesc"></div>
                        <template v-if="reputation.szMapNames && reputation.szMapNames.length">
                            <div class="sub-title">
                                <img src="@/assets/img/reputation/reputation_map.svg" width="15" svg-inline />
                                声望地图
                            </div>
                            <div class="u-desc">{{ reputation.szMapNames[0] }}</div>
                        </template>
                        <template v-if="reputation.GroupName">
                            <div class="sub-title">
                                <img src="@/assets/img/reputation/reputation_title.svg" width="15" svg-inline />
                                势力类型
                            </div>
                            <div class="u-desc">{{ reputation.GroupName }}</div>
                        </template>
                        <template>
                            <div class="sub-title">
                                <img src="@/assets/img/reputation/reputation_path.svg" width="15" svg-inline />
                                遗失的尊敬
                            </div>
                            <div class="u-desc">
                                {{ getPath(reputation.szName) || "无法使用遗失的尊敬来提高该声望等级进度" }}
                            </div>
                        </template>
                    </div>
                    <!-- 小程序 -->
                    <div class="m-detail-wrap__miniprogram">
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
                                    <div
                                        class="u-val"
                                        :class="{
                                            'no-map': !(
                                                reputation.szMapNames &&
                                                reputation.szMapNames.length &&
                                                reputation.Guides &&
                                                reputation.Guides.length &&
                                                !reputation.hiddenMap
                                            ),
                                        }"
                                    >
                                        {{ reputation?.szMapNames?.[0] || "-" }}
                                        <img
                                            v-if="
                                                reputation.szMapNames &&
                                                reputation.szMapNames.length &&
                                                reputation.Guides &&
                                                reputation.Guides.length &&
                                                !reputation.hiddenMap
                                            "
                                            class="u-icon"
                                            src="@/assets/img/reputation/map.svg"
                                            svg-inline
                                            width="14"
                                        />
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
                                {{ getPath(reputation.szName) || "无法使用遗失的尊敬来提高该声望等级进度" }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="m-content m-servant">
                    <div class="img-wrap">
                        <img
                            v-if="reputation.servant && reputation.servant.szImagePath"
                            :src="getIcon(reputation.servant.szImagePath, 'partner')"
                        />
                        <!-- 默认图片 -->
                        <img v-else src="@/assets/img/reputation/sw-null.jpg" />
                    </div>
                    <div class="detail-wrap" v-if="reputation.servant">
                        <div class="sub-title sub-name">
                            {{ reputation.servant && reputation.servant.szNpcName }}
                        </div>
                        <div class="u-desc" v-html="reputation.servant.szDescBrief"></div>
                        <div class="u-desc" v-html="reputation.servant.szDescPersonality.replace(/\\n/g, '<br>')"></div>
                        <div class="sub-title">
                            <img src="@/assets/img/reputation/reputation_title2.svg" width="15" svg-inline />
                            知交祝福
                        </div>
                        <div class="u-desc">
                            <span>{{ reputation.servant.szBuffName }}</span>
                            {{ reputation.servant.szBuffDesc }}
                        </div>
                    </div>
                </div>
                <!-- <div class="current-progress">
                    <div class="progress-num"><span>当前进度：中立</span><span>0</span></div>
                    <div class="progress-wrap">
                        <div class="progress-value"></div>
                    </div>
                </div> -->
            </div>
            <div
                class="map-wrapper"
                v-if="
                    reputation.szMapNames &&
                    reputation.szMapNames.length &&
                    reputation.Guides &&
                    reputation.Guides.length &&
                    !reputation.hiddenMap
                "
            >
                <div class="title">
                    声望商人
                    <span>{{ reputation.Guides[0].npcName }}</span>
                </div>
                <div class="map-content">
                    <reputation-map ref="map" :name="reputation.szMapNames[0]" :list="reputation.points" />
                </div>
            </div>
        </div>
        <!-- 小程序声望奖励 -->
        <div class="m-reputation-reward__miniprogram" v-if="reputation.gainList">
            <el-scrollbar>
                <div class="m-reward-tabs">
                    <div
                        class="u-reward-tab"
                        :class="{ active: stage === index }"
                        v-for="(item, index) in rewardList"
                        :key="index"
                        @click="stage = index"
                    >
                        {{ item.label }}
                    </div>
                </div>
                <div class="m-reward-content">
                    <div class="u-item">
                        <div class="u-label">提升方式</div>
                        <div class="u-value">{{ rewardList[stage]?.desc }}</div>
                    </div>
                    <div class="u-item">
                        <div class="u-label">阶段奖励（{{ rewardList[stage]?.label }}）</div>
                        <div class="u-value reward-content"></div>
                    </div>
                </div>
            </el-scrollbar>
        </div>
        <div v-if="showPath" class="reputation-reward-wrapper">
            <div class="title">声望奖励</div>
            <div class="reward-content">
                <div class="reward-desc-list">
                    <div
                        class="item"
                        :class="{ active: stage === index }"
                        v-for="(item, index) in reputation.gainList"
                        :key="index"
                        @click="stage = index"
                    >
                        <div class="from-to">{{ item.from }}<i class="el-icon-caret-right"></i>{{ item.to }}</div>
                        <div class="desc">
                            <div class="desc-title">提升方式：</div>
                            <div class="desc-content">{{ item.desc }}</div>
                        </div>
                    </div>
                </div>
                <div v-if="reputation.gainList" class="stage-reward-list" :class="{ active: stage !== -1 }">
                    <div class="stage-title">
                        <span
                            >阶段奖励（{{
                                stage === -1 ? reputation.gainList[0].from : reputation.gainList[stage].to
                            }}）</span
                        >
                        <div class="page-list" v-if="stageList.length && stageList[0].length">
                            <div
                                class="page-item"
                                :class="page === currentPage && 'active'"
                                v-for="page in pageLen"
                                :key="page"
                                @click="currentPage = page"
                            >
                                {{ page }}
                            </div>
                        </div>
                    </div>
                    <template v-if="stageList.length && stageList[0].length">
                        <div class="list">
                            <item-icon
                                v-for="reward in stageList[currentPage - 1]"
                                :key="reward"
                                :item_id="reward"
                                :onlyIcon="true"
                                :size="36"
                                class="u-item-icon"
                            ></item-icon>
                        </div>
                    </template>
                    <div v-else class="no-data">无</div>
                </div>
            </div>
        </div>
        <!-- 包含攻略、评论、历史版本、点赞等 书籍，宠物等物品为item, 声望成就等为achievement -->
        <pvx-user :id="achievement_id" name="声望" type="achievement"></pvx-user>

        <!-- 小程序知交 -->
        <el-drawer
            :title="`${reputation.servant && reputation.servant.szNpcName} - 声望知交`"
            :visible.sync="servantVisible"
            direction="btt"
            append-to-body
            :show-close="false"
        >
            <div class="m-servant-drawer" v-if="reputation.servant">
                <img
                    v-if="reputation.servant && reputation.servant.szImagePath"
                    :src="getIcon(reputation.servant.szImagePath, 'partner')"
                />
                <img v-else src="@/assets/img/reputation/sw-null.jpg" />
                <div class="m-buff">
                    <div>知交祝福</div>
                    <div class="u-desc">
                        <span>{{ reputation.servant.szBuffName }}</span>
                        {{ reputation.servant.szBuffDesc }}
                    </div>
                </div>
                <div class="u-desc" v-html="reputation.servant.szDescPersonality.replace(/\\n/g, '<br>')"></div>
            </div>
        </el-drawer>

        <!-- 小程序地图 -->
        <el-drawer
            :title="`${reputation.szMapNames[0]} - ${reputation.Guides[0].npcName} - 声望商人位置`"
            :visible.sync="mapVisible"
            direction="btt"
            append-to-body
            :show-close="false"
        >
            <div class="m-map-drawer">
                <reputation-map ref="map" :name="reputation.szMapNames[0]" :list="reputation.points" />
            </div>
        </el-drawer>
    </div>
</template>

<script>
import PvxUser from "@/components/PvxUser.vue";
import reputationMap from "@/components/reputation/ReputationMap.vue";
import ItemIcon from "@/components/common/item_icon.vue";
import paths from "@/assets/data/reputation_exchange_path.json";
import levelList from "@/assets/data/reputation_level.json";
import { isMiniProgram } from "@jx3box/jx3box-common/js/utils";

import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";

import { getInfo } from "@/service/reputation";

export default {
    name: "reputationSingle",
    components: {
        reputationMap,
        ItemIcon,
        PvxUser,
    },
    data() {
        return {
            compatible: false,
            is_empty: true,

            activeTab: 0,
            stage: -1,
            currentPage: 1,
            pageLen: 0,
            stageList: [],

            reputation: {
                dwForceID: -1,
                szName: "",
                szDesc: "",
            },
            loading: false,

            servantVisible: false,
            mapVisible: false,

            rewardMap: {
                3: "中立",
                4: "友好",
                5: "亲密",
                6: "敬重",
                7: "尊敬",
                8: "钦佩",
            },
        };
    },
    computed: {
        rewardList() {
            return Object.entries(this.rewardMap)
                .map(([key, val]) => {
                    const desc = this.reputation?.GainDesc?.find((item) => item.to == key)?.desc;
                    return {
                        label: val,
                        value: key,
                        desc,
                        list: this.showReward[key],
                    };
                })
                .filter((item) => item.desc);
        },
        id_str: function () {
            return String(this.id);
        },
        id: function () {
            return parseInt(this.$route.params.id);
        },
        achievement_id() {
            // 目前只对应了声望最高等级的成就
            return this.reputation.achievement?.[0]?.ID;
        },
        showReward: function () {
            return this.reputation.RewardItems;
        },
        showPath() {
            return this.reputation.gainList && this.reputation.gainList.length;
        },
        client() {
            return this.$store.state.client;
        },
    },
    methods: {
        goBack() {
            this.$router.push({ name: "reputation" });
        },
        getPath(name) {
            return paths.find((item) => item.reputations.includes(name))
                ? paths.find((item) => item.reputations.includes(name)).path
                : "";
        },
        getIcon(iconPath, type = "icon") {
            const iconName = iconPath ? iconPath.split("\\")[iconPath.split("\\").length - 1].split(".")[0] : "";
            const path = "reputation/reputation/std/" + type + "/";
            if (iconName) {
                return __imgPath + path + iconName.toLowerCase() + ".png";
            } else {
                return "";
            }
        },
        getLevelDesc(level) {
            return levelList.find((item) => item.level === Number(level))
                ? levelList.find((item) => item.level === Number(level)).name
                : "未知";
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
                        ? data.GainDesc.map((item) => {
                              return {
                                  fromID: Number(item.from),
                                  toID: Number(item.to),
                                  from: this.getLevelDesc(item.from),
                                  to: this.getLevelDesc(item.to),
                                  desc: item.desc,
                              };
                          })
                        : [];
                    data.rewards = data.RewardItems
                        ? Object.keys(data.RewardItems).map((item) => {
                              return {
                                  level: `【${this.getLevelDesc(item)}】声望奖励：`,
                                  list: data.RewardItems[item].map((reward) => {
                                      return {
                                          id: reward,
                                          amount: 1,
                                      };
                                  }),
                              };
                          })
                        : [];
                    data.points = [
                        {
                            mapId: data.szMapIDs,
                            guides: data.Guides && data.Guides.length && data.Guides[0],
                        },
                    ];
                    if (data?.Guides[0]?.positions.every((item) => item === 0)) {
                        data.hiddenMap = true;
                    }
                    this.reputation = data;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        handleTabClick(tab, event) {
            if (tab.name == "map") {
                setTimeout(() => {
                    this.$refs.map && this.$refs.map.updateSize();
                }, 100);
            }
        },
    },
    watch: {
        id: {
            immediate: true,
            handler(val) {
                val && this.getData();
            },
        },
        stage: {
            immediate: true,
            handler(stage) {
                this.currentPage = 1;
                this.stageList = [];
                const reputation = this.reputation;
                const gainList = reputation.gainList;
                if (gainList && gainList.length) {
                    const id = gainList[stage].toID;
                    const stageList = reputation.RewardItems[id] || [];
                    const sLen = stageList.length;
                    if (sLen > 48) {
                        const len = Math.ceil(sLen / 48);
                        this.pageLen = len;
                        for (let i = 0; i < len; i++) {
                            this.stageList.push(stageList.slice(48 * i, 48 * (i + 1)));
                        }
                    } else {
                        this.stageList = [stageList];
                    }
                }
            },
        },
    },
    mounted() {
        if (isMiniProgram()) {
            this.stage = 0;
        }
    },
};
</script>

<style lang="less">
@import "~@/assets/css/reputation/single.less";
@import "~@/assets/css/reputation/reputation_miniprogram.less";
</style>
