<!--
 * author - 作者信息组件
 * 
 * @description 用于脸型/体型详情页展示作者详细信息，包括头像、等级、VIP状态等
 * @author Face & Body 模块优化团队
 * @version 1.0.0
 * 
 * @features
 * - 显示作者头像和框架
 * - 显示作者名称和UID
 * - 显示用户等级（带颜色）
 * - 显示VIP状态
 * - 显示签约作者标识
 * - 显示用户自定义装扮
 * 
 * @props
 * - uid: Number - 用户ID
 * - avatar: String - 头像URL
 * - avatar_frame: String - 头像框架
 * - data: Object - 用户数据对象
 * 
 * @styles
 * - 使用 pvx-author-mixin 样式混合
 * - 样式文件: assets/css/common/face-body/index.less
 -->
<template>
    <div class="m-pvx-author__header">
        <div class="m-pvx-info">
            <Avatar class="u-pvx-avatar" :uid="uid" :url="avatar" :size="avatarSize" :frame="avatar_frame" />
            <div class="m-pvx-author__info">
                <span class="u-pvx-name">
                    <span>{{ data.display_name }}</span>
                    <span class="u-pvx-uid">(UID : {{ data.ID }})</span>
                </span>
                <div class="u-pvx-tips">
                    <el-tooltip :content="$t('pages.faceBody.detail.currentExperience', { value: data.experience || 0 })" placement="top">
                        <span class="u-pvx-level" :class="'lv-' + level"
                            :style="{ backgroundColor: showLevelColor(level) }">Lv.{{ level }}</span>
                    </el-tooltip>
                    <el-tooltip :content="vipTypeTitle" v-if="isPRO" placement="top">
                        <a class="u-pvx-vip" href="/vip/premium?from=user_homepage" target="_blank">
                            <i class="u-pvx-icon vip">{{ vipType }}</i>
                        </a>
                    </el-tooltip>
                    <el-tooltip :content="$t('pages.faceBody.detail.contractedCreator')" v-if="isSuperAuthor" placement="top">
                        <span class="u-pvx-superauthor">
                            <i class="u-pvx-icon superauthor">{{ $t("pages.faceBody.detail.contractedCreator") }}</i>
                        </span>
                    </el-tooltip>
                </div>
            </div>
        </div>
        <div class="m-pvx-mark">
            <span class="u-pvx-img">
                <img :src="`${img}/decoration/images/${userDefinedStyle.name}/homebanner.png`" />
            </span>
        </div>
    </div>
</template>
<script>
import { getUserInfo, getDecoration, getDecorationJson } from "@/service/common/user";
import { __userLevelColor, __imgPath } from "@/utils/config";
import User from "@jx3box/jx3box-common/js/user";
import Avatar from "@jx3box/jx3box-ui/src/author/Avatar.vue"
const DECORATION_JSON = "decoration_json";
const DECORATION_KEY = "decoration_me";
export default {
    name: "Author",
    components: {
        Avatar,
    },
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
            return this.$t(this.isPRO ? "pages.faceBody.detail.proMember" : "pages.faceBody.detail.premiumMember");
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
                try {
                    const decoration = JSON.parse(decoration_local);
                    this.userDefinedStyle = decoration || {};
                } catch (e) {
                    sessionStorage.removeItem(DECORATION_KEY + this.uid);
                    this.userDefinedStyle = {};
                }
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
                    if (decorationJson) {
                        try {
                            const theme = JSON.parse(decorationJson)[decoration.val];
                            this.userDefinedStyle = theme;
                        } catch (e) {
                            sessionStorage.removeItem(DECORATION_JSON);
                            this.userDefinedStyle = {};
                        }
                    }
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
.m-pvx-author__header {
    .pr;
    .clip;
    .size(100%, 220px);
    .r(10px);
    background-color: #fff;

    .m-pvx-mark {
        .flex;
        justify-content: flex-end;

        .u-pvx-img {
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

    .m-pvx-info {
        .flex;
        .size(100%);
        .pa;
        .z(2);
        align-items: center;
        padding: 20px;
        box-sizing: border-box;
    }

    .u-pvx-avatar {
        .size(120px);
        flex-shrink: 0;
        margin: 0 48px;
    }

    .m-pvx-author__info {
        .pr;
        .flex;
        flex-direction: column;
        flex: 1;
        color: #000;

        .u-pvx-tips {
            .h(24px);
            .mt(10px);
        }

        .u-pvx-name {
            .flex;
            .fz(26px);
            .bold(600);
            user-select: none;
            align-items: center;

            > * + * {
                .ml(10px);
            }

            .u-pvx-uid {
                .fz(14px);
            }
        }

        .u-pvx-level {
            .fz(14px, 1.5);
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

        .u-pvx-icon {
            .bold(600);
            cursor: default;
            .fz(14px, 1.5);
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

        .u-pvx-vip,
        .u-pvx-superauthor {
            margin-left: 4px;
            font-weight: normal;
        }

        .u-pvx-honor {
            .dbi;
            text-align: center;
            .size(220px, 45px);
            color: #ffffff;
            .fz(10px, 45px);
            .r(2px);
        }
    }

    .u-pvx-info {
        .fz(14px);
        color: #fff;
        .mt(10px);
        .w(420px);
        .break(1);
        cursor: pointer;
    }

    @media screen and (max-width: @ipad) {
        .m-pvx-mark {
            display: none;
        }
    }
}
</style>
