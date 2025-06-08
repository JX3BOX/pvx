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
        </template>
        <template v-else>
            <div class="m-robot__adventure-header" :class="isPerfect ? 'is-perfect' : ''">
                <div class="m-title">
                    <div class="u-title">{{ robotTitle }}</div>
                </div>
                <div class="m-rewards">
                    奖励：
                    <item_icon
                        :item_id="String(item)"
                        :size="16"
                        v-for="(item, i) in data?.RewdItem?.split(';') || ['8_38696']"
                        :key="i"
                    ></item_icon>
                </div>
            </div>
            <div class="m-robot__adventure-method">
                <img class="u-pvx-logo" :src="getImg(data)" />
            </div>
        </template>
        <!-- (小程序端)包含攻略、评论、历史版本、点赞等 书籍，宠物等物品为item, 声望成就等为achievement -->
        <PvxUserMiniprogram v-if="isMiniProgram" :id="achieve_id" name="奇遇" type="achievement"> </PvxUserMiniprogram>
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
    </div>
</template>

<script>
import { getLink } from "@jx3box/jx3box-common/js/utils";
import { getAdventure, getSerendipityAchievementId } from "@/service/adventure/adventure";
import PvxUser from "@/components/PvxUser.vue";
import item_icon from "@/components/common/item_icon.vue";
import task from "@/components/adventure/task.vue";
import Serendipity from "@/components/common/serendipity.vue";
import { postStat } from "@jx3box/jx3box-common/js/stat.js";
import PvxUserMiniprogram from "@/components/PvxUserMiniprogram.vue";
import { isMiniProgram } from "@jx3box/jx3box-common/js/utils";
import PvxSuspension from "@/components/PvxSuspension.vue";
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";
export default {
    name: "adventureSingle",
    props: ["isRobot", "sourceId"],
    components: {
        task,
        Serendipity,
        PvxUser,
        PvxUserMiniprogram,
        PvxSuspension,
        item_icon,
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
        };
    },
    computed: {
        id: function () {
            return this.$route.params.id || this.sourceId;
        },
        title: function () {
            return this.data?.szName;
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
        getImg(info) {
            const type = info.szRewardType;
            if (type === "school" || type === "camp") {
                return this.toSpecial(info);
            } else {
                let img = info.szOpenRewardPath?.toLowerCase().match(/.*[\/,\\]adventure(.*?).tga/) || "";
                let name = "";
                if (img?.[1]) name = img?.[1].replace(/\\/g, "/");
                return this.imgUrl(name);
            }
        },
        imgUrl(link) {
            const client = this.$store.state.client;
            return __imgPath + `adventure/adventure/${client}/${link}.png`;
        },
        getLink,
        goBack() {
            this.$router.push({ name: "list" });
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
    height: 75px;
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
}
.m-robot__adventure-method {
    .flex;
    justify-content: center;
    align-items: center;
    .u-pvx-logo {
        .size(143px);
    }
}
</style>
