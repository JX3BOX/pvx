<!--
 * Face - 脸型模块主入口组件
 * 
 * @description 脸型模块的根组件，包含导航栏、主内容区和页脚
 * @author Face & Body 模块优化团队
 * @version 1.0.0
 * 
 * @features
 * - 响应式导航栏状态管理
 * - 支持正式服和怀旧服切换
 * - 支持编辑权限判断
 * - 支持小程序环境检测
 * 
 * @components
 * - CommonHeader: 公共头部组件
 * - Nav: 导航栏组件
 * - Main: 主内容区组件
 * - CommonFooter: 公共页脚组件
 * 
 * @routes
 * - /face: 脸型列表页
 * - /face/:id: 脸型详情页
 * - /face/parse: 脸型解析页
 * 
 * @permissions
 * - 编辑权限: User.isEditor()
 -->
<template>
    <div id="app" class="p-pvx-face">
        <CommonHeader class="p-face-header"></CommonHeader>
        <Nav @statusChange="statusChange" class="p-nav"></Nav>
        <Main :class="navStatusClass" :withoutRight="true" :withoutLeft="true" :withoutBread="true">
            <div class="m-main"><router-view></router-view></div>
        </Main>
        <CommonFooter></CommonFooter>
    </div>
</template>

<script>
import Nav from "@/components/Nav_v5.vue";
import User from "@jx3box/jx3box-common/js/user";
import { isMiniProgram } from "@jx3box/jx3box-common/js/utils";
import { setStar, cancelStar, onlineFace, offlineFace, deleteFace } from "@/service/face/index.js";
export default {
    name: "App",
    props: [],
    components: { Nav },
    data: function () {
        return {
            navStatusClass: "is-regular",
            isEditor: User.isEditor(),
        };
    },
    computed: {
        id: function () {
            return this.$store.state.faceSingle?.id || "";
        },
        isAuthor: function () {
            return this.$store.state.faceSingle?.user_id == User.getInfo().uid || false;
        },
        //上下架状态
        status: function () {
            return this.$store.state.faceSingle?.status || 1;
        },
        statusText: function () {
            return this.status !== 1 ? "上架" : "下架";
        },
        isStar: function () {
            return this.$store.state.faceSingle?.star || 0;
        },
        starText: function () {
            return this.isStar ? "取消精选" : "精选";
        },
    },
    methods: {
        isMiniProgram,
        statusChange(navStatusClass) {
            this.navStatusClass = navStatusClass;
        },
        starSet() {
            this.$confirm("确认" + (this.isStar ? "取消精选" : "精选") + "该捏脸？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                beforeClose: (action, instance, done) => {
                    if (action === "confirm") {
                        instance.confirmButtonLoading = true;
                        if (this.isStar) {
                            //取精
                            cancelStar(this.id)
                                .then(() => {
                                    this.$store.commit("UPDATE_FACE_SINGLE", { star: 0 });
                                    done();
                                    this.$notify({
                                        title: "成功",
                                        message: "取消精选成功",
                                        type: "success",
                                    });
                                })
                                .finally(() => {
                                    instance.confirmButtonLoading = false;
                                });
                        } else {
                            //精
                            setStar(this.id)
                                .then(() => {
                                    this.$store.commit("UPDATE_FACE_SINGLE", { star: 1 });
                                    done();
                                    this.$notify({
                                        title: "成功",
                                        message: "精选成功",
                                        type: "success",
                                    });
                                })
                                .finally(() => {
                                    instance.confirmButtonLoading = false;
                                });
                        }
                    } else {
                        instance.confirmButtonLoading = false;
                        done();
                    }
                },
            });
        },
        statusSet() {
            //上下架操作，根据是否isEditor，在接口内调用管理和作者分别的接口
            this.$confirm("确认" + (this.status == 1 ? "下架" : "上架") + "该捏脸？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                beforeClose: (action, instance, done) => {
                    if (action === "confirm") {
                        instance.confirmButtonLoading = true;
                        if (this.status == 1) {
                            //下架
                            offlineFace(this.id, this.isEditor)
                                .then(() => {
                                    this.$store.commit("UPDATE_FACE_SINGLE", { status: 2 });
                                    done();
                                    this.$notify({
                                        title: "成功",
                                        message: "下架成功",
                                        type: "success",
                                    });
                                })
                                .finally(() => {
                                    instance.confirmButtonLoading = false;
                                });
                        } else {
                            //上架
                            onlineFace(this.id, this.isEditor)
                                .then(() => {
                                    this.$store.commit("UPDATE_FACE_SINGLE", { status: 1 });
                                    done();
                                    this.$notify({
                                        title: "成功",
                                        message: "上架成功",
                                        type: "success",
                                    });
                                })
                                .finally(() => {
                                    instance.confirmButtonLoading = false;
                                });
                        }
                    } else {
                        instance.confirmButtonLoading = false;
                        done();
                    }
                },
            });
        },
        delFace() {
            this.$confirm("确认删除该捏脸？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                beforeClose: (action, instance, done) => {
                    if (action === "confirm") {
                        instance.confirmButtonLoading = true;
                        deleteFace(this.id)
                            .then(() => {
                                done();
                                this.$notify({
                                    title: "成功",
                                    message: "删除成功",
                                    type: "success",
                                });
                            })
                            .finally(() => {
                                instance.confirmButtonLoading = false;
                            });
                    } else {
                        instance.confirmButtonLoading = false;
                        done();
                    }
                },
            });
        },
    },
};
</script>

<style lang="less">
    @import "~@/assets/css/app.less";
    @import "~@/assets/css/miniprogram.less";

    .p-pvx-face {
        background-color: #f6f8fa;
    }

    .v-miniprogram {
        .m-main {
            padding: 0;
        }
    }
</style>
