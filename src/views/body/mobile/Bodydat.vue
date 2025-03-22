<template>
    <div class="c-facedat" v-if="ready && group_tabs">
        <div class="m-body-list_mobile__tabs">
            <div class="u-tab_item" v-for="(item, index) in Object.values(group_tabs)" :key="index"
                :class="{ 'is-active': active == item.value }" @click="active = item.value">
                {{ item.label }}
            </div>
        </div>

        <template v-for="tab in Object.values(group_tabs)">
            <div class="c-facedat-preivew" v-show="active === tab.value" :key="tab.value">
                <div class="c-facedat-group">
                    <ul class="u-list">
                        <li v-for="(item, i) in currentGroup" :key="i">
                            <label>{{ item.name }}</label>
                            <span>{{ item.value }}</span>
                            <slider class="u-range" :min="item.min" :max="item.max" v-model="body_data.tBody[item.key]"
                                :disabled="false"></slider>
                        </li>
                    </ul>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import _ from "lodash";
import group_tabs from "@jx3box/jx3box-facedat/assets/data/body/body_group_tabs.json";
import group_fields from "@jx3box/jx3box-facedat/assets/data/body/body_group_fields.json";
import types from "@jx3box/jx3box-facedat/assets/data/index.json";
import field_range from "@jx3box/jx3box-facedat/assets/data/body/body_fields_reverse.json";
import Slider from "@jx3box/jx3box-facedat/src/Slider.vue";

export default {
    components: { Slider },
    data: function () {
        return {
            active: "whole",
            body_data: "",
            body_type: "",
            group_tabs,
            group_fields,
            field_range,
            types: types.bodyMap,
        };
    },
    computed: {
        ready: function () {
            return !!this.body_data;
        },
        // 当前体型的字段范围
        currentFieldRanges() {
            return field_range[this.types[this.body_type].value];
        },
        // 当前激活的分组标签内的字段
        currentGroupFields() {
            return this.group_fields[this.active];
        },
        // 当前激活的分组标签内的控件信息
        currentGroup() {
            return Object.keys(this.group_fields[this.active])
                .filter((key) => this.currentFieldRanges[key].use_for_body_type)
                .map((key) => {
                    return {
                        key: key,
                        ...this.currentGroupFields[key],
                        ...this.currentFieldRanges[key],
                        value: this.body_data.tBody[key],
                    };
                });
        },
    },
    watch: {
        data: {
            immediate: true,
            deep: true,
            handler() {
                this.render();
            },
        },
    },
    methods: {
        render() {
            // 是否为空
            //获取缓存
            let data = JSON.parse(sessionStorage.getItem("bodyData"));
            console.log(data);
            if (!data) {
                this.body_data = "";
                this.body_type = "";
                return;
            }

            // json 转为 object
            try {
                let body_data = data.object;
                this.body_type = body_data.nRoleType && body_data.nRoleType.toString();
                this.body_data = body_data;
            } catch (e) {
                this.body_data = "";
                this.body_type = "";
                this.$notify.error({
                    title: "错误",
                    message: "体型数据无法解析",
                });
            }
        },
    },
    mounted() { },
};
</script>

<style lang="less">
@import "~@/assets/css/body/data.less";

.slide-bar {
    background-color: rgb(107, 82, 255) !important;
}
</style>
