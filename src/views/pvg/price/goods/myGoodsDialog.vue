<template>
    <el-dialog
        class="m-pvx-price-follow-dialog"
        :title="$t('pages.pvg.price.ui.dialog.title')"
        v-model="dialogVisible"
        width="min(640px, calc(100vw - 32px))"
        @close="$emit('close')"
    >
        <div class="m-price-goods-mygoods" v-loading="loading">
            <template v-if="myPlanList.length">
                <div
                    class="m-price-goods-mygoods-group"
                    v-for="group in myPlanList"
                    :key="group.id"
                    @click="choiceGroup(group)"
                >
                    {{ group.title }}
                    <el-checkbox v-model="group.checked" readonly></el-checkbox>
                </div>
            </template>
            <div v-else>
                <div class="m-price-goods-empty" @click="goItem">
                    {{ $t("pages.pvg.price.ui.dialog.noList") }}
                    <span class="strong">{{ $t("pages.pvg.price.ui.actions.createList") }}</span>
                </div>
            </div>
        </div>

        <template #footer>
            <span class="dialog-footer">
                <el-button @click="$emit('close')">{{ $t("pages.pvg.price.ui.actions.cancel") }}</el-button>
                <el-button type="primary" @click="setMyFollowList">{{ $t("pages.pvg.price.ui.actions.confirm") }}</el-button>
            </span>
        </template>
    </el-dialog>
</template>
<script>
import { getMyPlans } from "@/service/pvg/plan.js";
import User from "@jx3box/jx3box-common/js/user";
export default {
    props: {
        myFollowData: {},
    },
    data() {
        return {
            myPlanList: [],
            dialogVisible: true,
            loading: false,
            followIdList: [],
        };
    },
    methods: {
        handleClose() {
            this.dialogVisible = false;
        },
        getPlanList() {
            this.loading = true;
            getMyPlans({ no_page: 1 }).then((res) => {
                this.loading = false;
                this.myPlanList = res.reverse() || [];
                this.myPlanList.forEach((item) => {
                    item.checked = this.followIdList.includes(item.id);
                });
            });
        },
        choiceGroup(group) {
            group.checked = !group.checked;
            if (group.checked) {
                this.followIdList.push(group.id);
            } else {
                const index = this.followIdList.indexOf(group.id);
                if (index > -1) {
                    this.followIdList.splice(this.followIdList.indexOf(group.id), 1);
                }
            }
        },
        setMyFollowList() {
            const myPlanIds = this.myPlanList.map((item) => item.id);
            const val = this.followIdList.filter((id) => myPlanIds.includes(id)).join(",");
            this.$emit("setMyFollowList", val);
        },
        goItem() {
            let host = location.origin;
            window.open(`${host}/pvg/manufacture`, "_blank", "noopener,noreferrer");
        },
    },
    mounted() {
        this.followIdList = JSON.parse(JSON.stringify(this.myFollowData));
        User.isLogin() && this.getPlanList();
    },
};
</script>
