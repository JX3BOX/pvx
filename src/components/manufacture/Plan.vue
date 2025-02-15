<template>
    <el-dialog :title="plan.title" :visible.sync="show" custom-class="m-plan-dialog" @close="close">
        <div class="m-dialog-content" v-loading="loading">
            <!-- 内容备注 -->
            <div class="m-plan-description">
                <span class="u-time">
                    <span>最后更新于 <i class="el-icon-time"></i>{{ date_format(plan.updated) }}</span>
                    <a :href="editLink(plan)" target="_blank" class="u-del">编辑清单</a>
                    <span class="u-del" @click="deletePlan(planId)">删除清单</span>
                </span>
                <span class="u-title"><b>备注：</b> {{ plan.description || "无" }}</span>
            </div>
            <!-- 物品 -->
            <div class="m-plan-item" v-if="plan.type == '1'">
                <template v-for="(item, index) in plan.relation">
                    <div class="m-border" :key="index" v-if="item.data && item.data.length">
                        <div class="u-title" v-if="item.title">{{ item.title }}</div>
                        <div class="m-content">
                            <div
                                class="u-item"
                                v-for="(el, key) in item.data"
                                :key="key"
                                :to="{ name: 'view', params: { item_id: el.id } }"
                            >
                                <span class="u-img">
                                    <itemIcon :item="el" :item_id="el.id" />
                                    <span class="u-count">{{ el.count }}</span>
                                </span>
                                <span class="u-name" :class="`quality-${el.Quality}`"> {{ el.Name }}</span>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
            <!-- 装备 -->
            <div class="m-border m-plan-equips" v-else-if="plan.type == '2'">
                <Equip :data="plan" />
                <div class="m-content">
                    <div class="u-list" v-for="(list, index) in equipList" :key="index">
                        <div class="u-item" v-for="(item, key) in list" :key="key">
                            <span class="u-title"> {{ item.label }}</span>
                            <div v-if="item.list.length">
                                <itemIcon
                                    class="u-equip"
                                    v-for="(eq, i) in item.list"
                                    :key="i"
                                    :has_title="true"
                                    :item="eq"
                                    :item_id="item.id"
                                />
                            </div>
                            <div v-else class="u-equip-null">- 暂无物品 -</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </el-dialog>
</template>
<script>
import { getItemPlanID, delItemPlan, searchItemsID } from "@/service/manufacture/plan.js";
import { ts2str } from "@jx3box/jx3box-common/js/utils";
import itemIcon from "./ItemIcon.vue";
import Equip from "./Equip.vue";
import Bus from "@/store/bus.js";
import { __Root } from "@jx3box/jx3box-common/data/jx3box.json";
export default {
    name: "Plan",
    props: ["planId", "visible"],
    components: { itemIcon, Equip },
    data: function () {
        return {
            loading: false,
            plan: "",
            date_format: ts2str,
            equipList: [
                [
                    { title: "melee_weapon", label: "武器", AucGenre: 1, list: [] },
                    { title: "range_weapon", label: "暗器", AucGenre: 2, list: [] },
                ],
                [
                    { title: "helm", label: "帽子", AucGenre: 3, AucSubType: 2, list: [] },
                    { title: "chest", label: "上衣", AucGenre: 3, AucSubType: 1, list: [] },
                    { title: "waist", label: "腰带", AucGenre: 3, AucSubType: 3, list: [] },
                ],
                [
                    { title: "bangle", label: "护腕", AucGenre: 3, AucSubType: 6, list: [] },
                    { title: "pants", label: "下装", AucGenre: 3, AucSubType: 4, list: [] },
                    { title: "boots", label: "鞋子", AucGenre: 3, AucSubType: 5, list: [] },
                ],
                [
                    { title: "amulet", label: "项链", AucGenre: 4, AucSubType: 1, list: [] },
                    { title: "pendant", label: "腰坠", AucGenre: 4, AucSubType: 3, list: [] },
                    { title: "ring_1", label: "戒指", AucGenre: 4, AucSubType: 2, list: [] },
                    { title: "ring_2", label: "戒指", AucGenre: 4, AucSubType: 2, list: [] },
                ],
            ],
        };
    },
    computed: {
        show: {
            get() {
                return this.visible;
            },
            set() {
                this.close();
            },
        },
    },
    watch: {
        planId: {
            immediate: true,
            handler: function (val) {
                val && this.getItemData();
            },
        },
    },
    methods: {
        // 获取数据
        getItemData() {
            this.loading = true;
            getItemPlanID(this.planId).then((res) => {
                this.loading = false;
                this.converted(res);
                if (res.type == 2) this.toEquipList(res.relation);
            });
        },

        // 兼容旧数据,转换数据
        converted(data) {
            if (data.type == 1) {
                data.relation = data.relation.map((item) => {
                    item.data = item.data.map((el) => {
                        if (typeof el == "string") el = { id: el, count: 1 };
                        if (typeof el == "object") el = { id: el.id, count: el.count };
                        return el;
                    });
                    return item;
                });

                // 统一获取物品信息
                let _arr = [];
                data.relation.forEach((list) => {
                    list.data.forEach((el) => {
                        _arr.push(el.id);
                    });
                });
                searchItemsID({ ids: _arr }).then((res) => {
                    let items = res.data;

                    data.relation = data.relation.map((item) => {
                        item.data = item.data.map((el) => {
                            let a = items.filter((k) => {
                                if (k.id == el.id) return { ...k, ...el };
                            });
                            el = { ...el, ...a[0] };
                            return el;
                        });
                        return item;
                    });
                    this.plan = data;
                });
            } else {
                data.relation = this.equipItem(data.relation);
                let _arr = [];
                for (const key in data.relation) {
                    _arr.push(...data.relation[key]);
                }
                searchItemsID({ ids: _arr }).then((res) => {
                    let items = res.data;
                    for (const key in data.relation) {
                        data.relation[key] = data.relation[key].map((el) => {
                            el = items.filter((k) => {
                                if (el == k.id) return k;
                            });
                            return el[0];
                        });
                    }
                    this.plan = data;
                    this.equipList.map((list) => {
                        list.map((item) => {
                            item.list = item.list.map((el) => {
                                el = items.filter((k) => {
                                    if (k.id == el) return k;
                                });
                                return el[0];
                            });
                            return item;
                        });
                        return list;
                    });
                });
            }
        },
        // 将装备object转换为string
        equipItem(data) {
            for (const key in data) {
                data[key] = data[key].map((item) => {
                    if (typeof item == "object") item = item.id;
                    return item;
                });
            }
            return data;
        },
        // 装备分组
        toEquipList(_obj) {
            this.equipList.map((list) => {
                list.map((el) => {
                    if (_obj.hasOwnProperty(el.title)) {
                        el.list = _obj[el.title];
                    }
                });
            });
        },
        // 装备提交数据转换
        toEquip() {
            let obj = {};
            this.equipList.forEach((list) => {
                list.forEach((el) => {
                    obj[el.title] = el.list;
                });
            });
            obj = this.equipItem(obj);
            this.plan.relation = obj;
        },
        // 删除清单
        deletePlan(planId) {
            this.$confirm("确认是否删除该物品清单？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                delItemPlan(planId).then(() => {
                    this.$message.success("删除成功");
                    this.$emit("close");
                });
            });
        },
        // 编辑清单跳转
        editLink({ id }) {
            return __Root + "item/plan_edit/" + id;
        },
        close() {
            Bus.$emit("update");
            this.$emit("close");
        },
    },
};
</script>
<style lang="less">
@import "~@/assets/css/manufacture/plan.less";
</style>
