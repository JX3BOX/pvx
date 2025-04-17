<template>
    <div id="app" class="p-pet">
        <Header></Header>
        <Nav @statusChange="statusChange" class="p-nav"></Nav>
        <Main :class="navStatusClass" :withoutRight="true">
            <div class="m-main"><router-view></router-view></div>
        </Main>
    </div>
</template>

<script>
const single_pages = ["single"];
import Nav from "@/components/Nav_v5.vue";
import User from "@jx3box/jx3box-common/js/user";
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
        isSinglePage: function () {
            return single_pages.includes(this.$route.name);
        },
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
                                    this.$store.state.faceSingle.star = 0;
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
                                    this.$store.state.faceSingle.star = 1;
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
                                    this.$store.state.faceSingle.status = 2;
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
                                    this.$store.state.faceSingle.status = 1;
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

.v-miniprogram {
    .m-main {
        padding: 0;
    }
}
</style>
