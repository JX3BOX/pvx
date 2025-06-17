<template>
    <div class="p-adventure-single" v-if="id" v-loading="loading">
        <template v-if="!isRobot">
            <!-- TODO需更换参数 -->
            <PvxSuspension
                isType="single"
                type="adventure"
                :id="id"
                :title="title"
                :miniprogram="{ app: '捏脸', filter_name: 'pvxface' }"
            />
            <div class="m-adventure-navigation">
                <div class="u-goback" @click="goBack">返回列表</div>
                <PvxSingleAdminDrop></PvxSingleAdminDrop>
                <!-- <el-input
                placeholder="请输入奇遇或宠物名字搜索"
                v-model="search"
                class="u-input"
                @keyup.enter.native="goSearch"
            >
                <el-button slot="append" icon="el-icon-search" @click="goSearch"></el-button>
            </el-input> -->
            </div>
            <div class="m-adventure-header">
                <span class="m-adventure-title">{{ title }}</span>
                <div class="m-trigger-links">
                    <a class="u-link u-achievement" :href="getLink('cj', achieve_id)" target="_blank">
                        <i class="el-icon-trophy"></i>
                        成就信息
                    </a>
                </div>
            </div>
            <div class="m-adventure-content">
                <task :id="id" :info="data" />
            </div>
            <!-- (小程序端)包含攻略、评论、历史版本、点赞等 书籍，宠物等物品为item, 声望成就等为achievement -->
            <PvxUserMiniprogram v-if="isMiniProgram" :id="achieve_id" name="奇遇" type="achievement">
            </PvxUserMiniprogram>
            <!-- 包含攻略、评论、历史版本、点赞等 书籍，宠物等物品为item, 声望成就等为achievement -->
            <pvx-user
                :id="achieve_id"
                name="奇遇"
                type="achievement"
                :isRobot="isRobot"
                v-if="achieve_id && !isMiniProgram"
            >
                <template slot="serendipity" v-if="!isRobot">
                    <div class="m-adventure-serendipity">
                        <Serendipity :title="title" />
                    </div>
                </template>
            </pvx-user>
        </template>
        <template v-else>
            <div class="m-robot__adventure-header" :class="isPerfect ? 'is-perfect' : ''">
                <div class="m-title">
                    <div class="u-title">{{ robotTitle }}</div>
                </div>
                <div class="m-reward">
                    <!-- <span>奖励：</span> -->
                    <div class="u-reward" v-html="rewardContent"></div>
                </div>
                <!-- <div class="m-rewards" v-if="data?.RewdItem?.split(';')?.length">
                    奖励：
                    <item_icon
                        :item_id="String(item)"
                        :size="16"
                        v-for="(item, i) in data.RewdItem.split(';')"
                        :key="i"
                    ></item_icon>
                </div> -->
            </div>
            <div class="m-robot-item m-robot__adventure-condition">
                <img class="u-pvx-logo" :src="imgUrl" />
                <div class="m-condition">
                    <div class="m-title">
                        <img src="@/assets/img/jx3box_qqbot_adventure_item.svg" alt="" />
                        <div class="u-title">触发前置</div>
                        <span>（需全部满足）</span>
                    </div>
                    <div class="m-content">
                        <div class="u-content" v-html="conditionContent"></div>
                    </div>
                </div>
            </div>
            <div class="m-robot-item m-robot__adventure-method">
                <div class="m-title">
                    <img src="@/assets/img/jx3box_qqbot_adventure_item.svg" alt="" />
                    <div class="u-title">触发方式</div>
                    <span>（完成任一均有可能触发奇遇）</span>
                </div>
                <div class="m-content">
                    <div class="u-content" v-html="methodContent"></div>
                </div>
            </div>
            <div class="m-robot-item m-robot__adventure-method">
                <div class="m-title">
                    <img src="@/assets/img/jx3box_qqbot_adventure_item.svg" alt="" />
                    <div class="u-title">奇遇流程</div>
                    <span>（以魔盒在线版本为准）</span>
                </div>
                <div class="m-content">
                    <div class="u-content" v-html="processContent"></div>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import { getLink } from "@jx3box/jx3box-common/js/utils";
import { getAdventure, getSerendipityAchievementId } from "@/service/adventure/adventure";
import PvxUser from "@/components/PvxUser.vue";
// import item_icon from "@/components/common/item_icon.vue";
import task from "@/components/adventure/task.vue";
import Serendipity from "@/components/common/serendipity.vue";
import { postStat } from "@jx3box/jx3box-common/js/stat.js";
import PvxUserMiniprogram from "@/components/PvxUserMiniprogram.vue";
import { isMiniProgram } from "@jx3box/jx3box-common/js/utils";
import PvxSuspension from "@/components/PvxSuspension.vue";
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";
import { wiki } from "@jx3box/jx3box-common/js/wiki_v2.js";
import PvxSingleAdminDrop from "@/components/common/PvxSingleAdminDrop.vue";
export default {
    name: "adventureSingle",
    props: ["isRobot", "sourceId"],
    components: {
        task,
        Serendipity,
        PvxUser,
        PvxUserMiniprogram,
        PvxSuspension,
        PvxSingleAdminDrop,
        // item_icon,
    },
    data: function () {
        return {
            type: "adventure",
            achieve_id: "",
            data: "",
            task: [],
            isPet: true,
            loading: false,
            search: "",
            isMiniProgram: isMiniProgram(),
            conditionContent: "",
            methodContent: "",
            processContent: "",
            rewardContent: "",
            camp: 1,
            force: 2,
        };
    },
    computed: {
        id: function () {
            return this.$route.params.id || this.sourceId;
        },
        title: function () {
            return this.data?.szName || "";
        },
        client() {
            return this.$store.state.client;
        },
        isPerfect() {
            return !!this.data?.bPerfect;
        },
        robotTitle() {
            let titlePrefix = "奇遇";
            if (this.isPerfect) {
                titlePrefix = "绝世奇遇";
            }
            if (this.data?.nClassify === 1) {
                titlePrefix = "宠物奇遇";
            }
            return titlePrefix + " · " + this.title;
        },
        defaultImg: function () {
            return __imgPath + "image/pvx/bg.png";
        },
        imgUrl() {
            const client = this.client;
            // const client = "std"; // 怀旧服的奇遇图片先取正式服的
            let tgaPath = this.data.szOpenRewardPath?.toLowerCase();
            if (!tgaPath) return "";
            tgaPath = tgaPath.replace(/\\/g, "/").replace("ui/image/adventure/", "");
            if (!this.data.szRewardType) {
                let pngPath = tgaPath.replace(/\.tga$/, ".png");
                return `${__imgPath}adventure/adventure/${client}/${pngPath}`;
            }
            // 传给组件的数据是修改过的
            tgaPath = tgaPath.replace(/\/[^\/]+?\.tga$/, "");
            if (this.data.szRewardType === "camp")
                return `${__imgPath}adventure/adventure/${client}/${tgaPath}/camp_${this.camp}_open.png`;
            if (this.data.szRewardType === "school")
                return `${__imgPath}adventure/adventure/${client}/${tgaPath}/school_${this.force}_open.png`;
            return defaultImg;
        },
    },
    watch: {
        id: {
            immediate: true,
            handler: function (val) {
                if (val) {
                    this.getData();
                }
            },
        },
    },
    methods: {
        getLink,
        goBack() {
            this.$router.push({ name: "list" });
        },
        //百科相关
        loadData: async function () {
            // 获取最新攻略
            if (this.achieve_id) {
                await wiki.mix({ type: "achievement", id: this.achieve_id, client: this.client }).then((res) => {
                    const { post } = res;
                    const content = post?.content || "";
                    // 触发前置
                    // 触发方式
                    // 奇遇流程
                    // 奇遇奖励
                    const contentList = content.split("<p>◆◆◆◆◆◆</p>");
                    this.conditionContent = (contentList?.[0] || "").replaceAll("&nbsp;", "");
                    this.methodContent = (contentList?.[1] || "").replaceAll("&nbsp;", "");
                    this.processContent = (contentList?.[2] || "").replaceAll("&nbsp;", "");
                    this.rewardContent = (contentList?.[3] || "").replaceAll("&nbsp;", "");
                });
                // TEST:请注意，为防止QQBOT无法抓取完全，请不要删除本行
                window.__READY__ = true;
            }
        },
        getData() {
            this.loading = true;
            getAdventure(this.id, {
                client: this.$store.state.client,
            })
                .then((res) => {
                    this.isPet = false;
                    this.data = res.data;
                    document.title = this.data?.szName;
                })
                .finally(() => {
                    this.loading = false;
                    postStat(this.type, this.id);
                });
            getSerendipityAchievementId(this.id, {
                client: this.$store.state.client,
            }).then((res) => {
                this.achieve_id = res.data?.achievement_id;
                this.loadData();
            });
        },
        goSearch() {
            this.$router.push({ name: "list", params: { search: this.search } });
        },
    },
    mounted: function () {},
};
</script>

<style lang="less">
@import "~@/assets/css/adventure/single.less";
.m-robot__adventure-header {
    padding: 12px;
    width: 100%;
    min-height: 75px;
    opacity: 1;
    border-radius: 8px;
    box-sizing: border-box;
    background: linear-gradient(to top, rgba(56, 56, 56, 1) 0%, rgba(0, 0, 0, 1) 100%);

    border: 1px solid rgba(110, 110, 110, 1);
    &.is-perfect {
        background: linear-gradient(to top, rgba(82, 44, 11, 1) 0%, rgba(0, 0, 0, 1) 100%);

        border: 1px solid rgba(255, 195, 0, 1);
    }
    .u-title {
        font-size: 20px;
        .bold;
        color: #fff;
    }
    .m-rewards {
        .flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 5px;
        margin-top: 4px;
        color: rgba(255, 235, 59, 1);
        font-size: 12px;
        .u-item .u-item-name {
            font-size: 12px;
        }
    }
    .m-reward {
        margin-top: 4px;
        .flex;
        align-items: center;
        flex-wrap: nowrap;
        gap: 4px;
        font-size: 12px;
        color: #ffeb3b;
        span {
            flex: none;
        }
        .u-reward {
            flex: none;
            .flex;
            align-items: center;
            flex-wrap: wrap;
            & > p:first-child {
                .none;
            }
        }
        p {
            margin: 0;
            padding: 0;
        }
        img,
        h1 {
            .none;
        }
        .c-article {
            .flex;
            flex-wrap: wrap;
            gap: 4px;
            align-items: center;
        }
    }
}
.m-robot__adventure-condition {
    .flex;
    gap: 5px;
    .u-pvx-logo {
        .size(180px);
    }
    .m-condition {
        flex: 1;
    }
}
.m-robot-item {
    margin-top: 10px;
    .u-content {
        width: 100%;
        line-height: 18px;
        h1 {
            .none;
        }
        p {
            margin-top: 0;
            margin-bottom: 5px;
        }
        img {
            margin: 5px 0;
        }
    }
    .m-title {
        .flex;
        align-items: center;
        gap: 4px;
        span {
            font-size: 12px;
            font-weight: 400;
            color: rgba(#ffffff, 0.5);
        }
    }
    .u-title {
        font-size: 16px;
        color: #ffc300;
        font-weight: 700;
    }
    .m-content {
        margin-top: 10px;
        border-radius: 4px;
        background: linear-gradient(to top, #383838 0%, #000000 100%);

        border: 1px solid #6e6e6e;

        box-shadow: inset 0px 10px 5px #000000;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 12px 12px 12px 12px;
        font-size: 10px;
        color: #fff;
    }
}
</style>
