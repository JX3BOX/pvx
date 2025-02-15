<template>
    <div class="m-author-header">
        <div class="m-info">
            <Avatar class="u-avatar" :uid="uid" :url="avatar" :size="avatarSize" :frame="avatar_frame" />
            <div class="m-author-info">
                <span class="u-name">
                    <span>{{ data.display_name }}</span>
                    <span class="u-uid">(UID : {{ data.ID }})</span>
                </span>
                <div class="u-tips">
                    <el-tooltip :content="`当前经验 ${data.experience || 0}`" placement="top">
                        <span class="u-level" :class="'lv-' + level" :style="{ backgroundColor: showLevelColor(level) }"
                            >Lv.{{ level }}</span
                        >
                    </el-tooltip>
                    <el-tooltip :content="vipTypeTitle" v-if="isPRO" placement="top">
                        <a class="u-vip" href="/vip/premium?from=user_homepage" target="_blank">
                            <i class="u-icon vip">{{ vipType }}</i>
                        </a>
                    </el-tooltip>
                    <el-tooltip content="签约作者" v-if="isSuperAuthor" placement="top">
                        <span class="u-superauthor">
                            <i class="u-icon superauthor">签约作者</i>
                        </span>
                    </el-tooltip>
                </div>
            </div>
        </div>
        <div class="m-mark">
            <span class="u-img">
                <img :src="`${img}/decoration/images/${userDefinedStyle.name}/homebanner.png`" />
            </span>
        </div>
    </div>
</template>
<script>
import { getUserInfo, getDecoration, getDecorationJson } from "@/service/face";
import { __userLevelColor, __imgPath } from "@jx3box/jx3box-common/data/jx3box";
import User from "@jx3box/jx3box-common/js/user";
const DECORATION_JSON = "decoration_json_face";
const DECORATION_KEY = "decoration_me_face";
export default {
    name: "Author",
    props: ["uid"],
    watch: {},
    data: function () {
        return {
            img: __imgPath,
            avatarSize: "l",
            data: {},
            userDefinedStyle: {},
        };
    },
    watch: {
        uid: {
            immediate: true,
            handler: function (id) {
                if (id) this.loadData();
            },
        },
    },
    computed: {
        avatar: function () {
            return this.data.user_avatar || "";
        },
        avatar_frame: function () {
            return this.data.user_avatar_frame || "";
        },
        isPRO: function () {
            return this.data?.is_pro;
        },
        isSuperAuthor: function () {
            return !!this.data?.sign;
        },
        vipType: function () {
            return this.isPRO ? "PRO" : "PRE";
        },
        vipTypeTitle: function () {
            return this.isPRO ? "专业版会员用户" : "高级版会员用户";
        },
        level: function () {
            return User.getLevel(this.data?.experience || 0);
        },
    },

    methods: {
        loadData() {
            getUserInfo(this.uid).then((res) => {
                this.data = res.data.data;
            });
            this.getDecorationStyle();
        },
        async getDecorationStyle() {
            let decoration_local = sessionStorage.getItem(DECORATION_KEY + this.uid);
            if (decoration_local) {
                const decoration = JSON.parse(decoration_local);
                this.userDefinedStyle = decoration ? decoration : {}; 
                return;
            }
            await getDecoration({ using: 1, user_id: this.uid, type: "homebg" }).then((res) => {
                const decoration = res.data.data[0];
                if (!decoration) return;
                let decorationJson = sessionStorage.getItem(DECORATION_JSON);
                if (!decorationJson) {
                    getDecorationJson().then((json) => {
                        const decoration_json = json.data;
                        const theme = JSON.parse(JSON.stringify(decoration_json[decoration.val]));
                        sessionStorage.setItem(DECORATION_KEY + this.uid, JSON.stringify(theme));
                        sessionStorage.setItem(DECORATION_JSON, JSON.stringify(decoration_json));
                        this.userDefinedStyle = theme;
                    });
                } else {
                    const theme = JSON.parse(decorationJson)[decoration.val];
                    this.userDefinedStyle = theme;
                }
            });
        },
        showLevelColor(level) {
            return __userLevelColor[level];
        },
    },
};
</script>

<style lang="less">
.m-author-header {
    .pr;
    .clip;
    .size(100%,220px);
    .r(10px);
    background-color: #fff;

    .m-mark {
        .flex;
        justify-content: flex-end;
        .u-img {
            .pr;
            img {
                .h(220px);
            }
            &:after {
                content: "";
                .pa;
                .h(220px);
                .lt(0);
                min-width: 1100px;
                background: linear-gradient(to left, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
            }
        }
    }
    .m-info {
        .flex;
        .full;
        .pa;
        .z(2);
        align-items: center;
        padding: 20px;
        box-sizing: border-box;
    }
    .u-avatar {
        .size(120px);
        flex-shrink: 0;
        margin: 0 48px;
    }
    .m-author-info {
        .pr;
        .flex;
        flex-direction: column;
        flex: 1;
        color: #000;
        .u-tips {
            .h(24px);
            .mt(10px);
        }
        .u-name {
            .flex;
            .fz(26px);
            .bold(600);
            user-select: none;
            gap: 10px;
            align-items: center;
            .u-uid {
                .fz(14px);
            }
        }
        .u-level {
            .fz(14px,1.5);
            color: #fff;
            background-color: #aaa;
            padding: 1px 6px;
            border-radius: 2px;
            font-style: normal;
            .bold(600);
            &.lv-1 {
                background-color: #32d3c4;
            }
            &.lv-2 {
                background-color: #86c0fb;
            }
            &.lv-3 {
                background-color: #33d9ff;
            }
            &.lv-4 {
                background-color: #ffdb2a;
            }
            &.lv-5 {
                background-color: #ffa739;
            }
            &.lv-6 {
                background-color: #ff70b2;
            }
            &.lv-7 {
                background-color: #ff3399;
            }
            &.lv-8 {
                background-color: #f93c3c;
            }
        }

        .u-icon {
            .bold(600);
            cursor: default;
            .fz(14px,1.5);
            font-style: normal;
            padding: 1px 6px;
            border-radius: 2px;
            background-color: #ddd;
            color: #fff;
            &.vip {
                background-color: #6f42c1;
            }
            &.superauthor {
                background-color: #f8b718;
            }
        }
        .u-vip,
        .u-superauthor {
            margin-left: 4px;
            font-weight: normal;
        }
        .u-honor {
            .dbi;
            text-align: center;
            .size(220px,45px);
            // background-color: #494038;
            color: #ffffff;
            .fz(10px,45px);
            .r(2px);
        }
    }
    .u-info {
        .fz(14px);
        color: #fff;
        .mt(10px);
        .w(420px);
        .break(1);
        cursor: pointer;
    }
    @media screen and (max-width: @ipad) {
        .m-mark {
            display: none;
        }
    }
}
</style>
