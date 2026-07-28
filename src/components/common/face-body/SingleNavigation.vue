<!--
 * SingleNavigation - 详情页导航组件
 * 
 * @description 用于脸型/体型详情页顶部导航区域，包含返回、发布、管理功能
 * @author Face & Body 模块优化团队
 * @version 1.0.0
 * 
 * @features
 * - 支持face和body两种类型
 * - 返回列表功能
 * - 发布作品入口
 * - 管理作品入口
 * 
 * @props
 * - type: 'face' | 'body' - 模块类型
 * 
 * @events
 * - back: 返回事件
 * 
 * @styles
 * - 使用 pvx-navigation-mixin 样式混合
 * - 样式文件: assets/css/common/face-body/index.less
 -->
<template>
    <div class="m-pvx-navigation">
        <div class="u-pvx-goback" @click="handleGoBack">
            <ArrowLeft class="u-pvx-back-icon" />
            {{ $t("pages.faceBody.detail.backToList") }}
        </div>

        <div class="m-pvx-type__btn-box">
            <a :href="publishLink" target="_blank">
                <div class="u-pvx-type-publish">
                    <img svg-inline src="@/assets/img/common/face-body/publish.svg" class="u-pvx-img" />
                    <span class="u-fb-publish-text">{{ publishText }}</span>
                </div>
            </a>
            <el-dropdown
                v-if="isEditor && type === 'face'"
                trigger="click"
                popper-class="m-pvx-manage-dropdown"
                :disabled="managementLoading"
                @command="handleManagementCommand"
            >
                <div class="u-pvx-manage" :class="{ 'is-loading': managementLoading }"></div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="star">
                            <span class="u-manage-menu-icon is-star">
                                <el-icon><StarFilled v-if="Number(post.star)" /><Star v-else /></el-icon>
                            </span>
                            <span>{{ starActionText }}</span>
                        </el-dropdown-item>
                        <el-dropdown-item command="status">
                            <span class="u-manage-menu-icon is-status">
                                <el-icon><Bottom v-if="Number(post.status) === 1" /><Top v-else /></el-icon>
                            </span>
                            <span>{{ statusActionText }}</span>
                        </el-dropdown-item>
                        <el-dropdown-item command="delete" divided class="is-danger">
                            <span class="u-manage-menu-icon is-delete"><el-icon><Delete /></el-icon></span>
                            <span>删除</span>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
            <a v-else-if="isEditor" :href="manageLink" target="_blank">
                <div class="u-pvx-manage"></div>
            </a>
        </div>
    </div>
</template>

<script>
import { publishLink } from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user";
import { ArrowLeft, Bottom, Delete, Star, StarFilled, Top } from "@element-plus/icons-vue";
import { setStar, cancelStar, onlineFace, offlineFace, managerDeleteFace } from "@/service/face";

/**
 * SingleNavigation - 详情页导航组件
 * 用于脸型/体型详情页顶部导航区域
 * 包含返回列表、发布按钮、管理按钮
 *
 * 样式说明：
 * - 组件使用统一类名 m-pvx-navigation、m-pvx-type__btn-box 等
 * - 样式由页面引入的 less 文件控制（body/single.less 或 face/single.less）
 * - 通过 face-body/index.less 中的 pvx-navigation-mixin 定义样式
 */
export default {
    name: "SingleNavigation",
    components: { ArrowLeft, Bottom, Delete, Star, StarFilled, Top },
    props: {
        // 类型标识：face（脸型）或 body（体型）
        type: {
            type: String,
            default: "face",
            validator: (val) => ["face", "body"].includes(val),
        },
        post: {
            type: Object,
            default: () => ({}),
        },
    },
    emits: ["updated"],
    data() {
        return {
            managementLoading: false,
        };
    },
    computed: {
        isEditor() {
            return User.isEditor();
        },
        // 发布按钮文案
        publishText() {
            const key = this.type === "face" ? "publishFace" : "publishBody";
            return this.$t(`pages.faceBody.detail.${key}`);
        },
        // 发布链接
        publishLink() {
            return publishLink(this.type);
        },
        // 管理链接
        manageLink() {
            return `/os/#/omp/pvx/${this.type}data`;
        },
        statusActionText() {
            return Number(this.post.status) === 1 ? "下架" : "上架";
        },
        starActionText() {
            return Number(this.post.star) ? "取消加精" : "加精";
        },
    },
    methods: {
        // 返回列表操作
        handleGoBack() {
            // 跳转到列表页
            this.$router.push({ name: "list" });
        },
        async handleManagementCommand(command) {
            if (!this.isEditor || this.managementLoading || !this.post.id) return;

            const actionText = command === "status" ? this.statusActionText : command === "star" ? this.starActionText : "删除";
            try {
                await this.$confirm(`确认${actionText}该捏脸？`, "管理操作", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: command === "delete" ? "error" : "warning",
                });
            } catch (e) {
                return;
            }

            this.managementLoading = true;
            try {
                let patch = {};
                if (command === "status") {
                    const isOnline = Number(this.post.status) === 1;
                    await (isOnline ? offlineFace(this.post.id, true) : onlineFace(this.post.id, true));
                    patch = { status: isOnline ? 2 : 1 };
                } else if (command === "star") {
                    const isStar = Boolean(Number(this.post.star));
                    await (isStar ? cancelStar(this.post.id) : setStar(this.post.id));
                    patch = { star: isStar ? 0 : 1 };
                } else if (command === "delete") {
                    await managerDeleteFace(this.post.id);
                    this.$notify.success({ title: "成功", message: "删除成功" });
                    this.$router.push({ name: "list" });
                    return;
                }

                this.$emit("updated", patch);
                this.$notify.success({ title: "成功", message: `${actionText}成功` });
            } catch (e) {
                this.$notify.error({ title: "失败", message: `${actionText}失败，请稍后重试` });
            } finally {
                this.managementLoading = false;
            }
        },
    },
};
</script>

<style lang="less">
.m-pvx-manage-dropdown {
    min-width: 168px;
    overflow: hidden;
    border: 1px solid #e8ebf2;
    border-radius: 12px;
    box-shadow: 0 12px 32px rgba(15, 23, 42, 0.14);

    .el-dropdown-menu {
        padding: 6px;
    }

    .el-dropdown-menu__item {
        height: 44px;
        justify-content: flex-start;
        gap: 10px;
        padding: 0 12px;
        border-radius: 8px;
        color: #475569;
        font-weight: 500;
        line-height: 44px;
        transition: color 0.18s ease, background-color 0.18s ease;

        &:not(.is-disabled):focus,
        &:not(.is-disabled):hover {
            color: #5b5cf5;
            background: #f1f0ff;
        }

        &.el-dropdown-menu__item--divided {
            margin-top: 6px;

            &::before {
                left: -6px;
                right: -6px;
                background: #edf0f5;
            }
        }

        &.is-danger {
            color: #ef4444;

            &:focus,
            &:hover {
                color: #dc2626;
                background: #fef2f2;
            }
        }

        .u-manage-menu-icon {
            display: inline-flex;
            width: 28px;
            height: 28px;
            flex: 0 0 28px;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            background: #f4f5f8;

            .el-icon {
                width: 18px;
                height: 18px;
                margin: 0;
                font-size: 18px;
                line-height: 1;

                svg {
                    display: block;
                    width: 100%;
                    height: 100%;
                }
            }

            &.is-star {
                color: #d97706;
                background: #fff7e6;
            }

            &.is-status {
                color: #5b5cf5;
                background: #efefff;
            }

            &.is-delete {
                color: #ef4444;
                background: #fef2f2;
            }
        }
    }
}

.u-pvx-manage {
    cursor: pointer;

    &.is-loading {
        cursor: wait;
        opacity: 0.65;
    }
}
</style>
