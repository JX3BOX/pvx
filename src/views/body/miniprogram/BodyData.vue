<template>
    <div class="m-pvx-body-data" v-if="ready && group_tabs">
        <div class="m-pvx-body-list-mobile__tabs">
            <div class="u-pvx-tab-item" v-for="(item, index) in Object.values(group_tabs)" :key="index"
                :class="{ 'is-active': active == item.value }" @click="active = item.value">
                {{ item.label }}
            </div>
        </div>

        <template v-for="tab in Object.values(group_tabs)" :key="tab.value">
            <div class="m-pvx-fb-data-preview" v-show="active === tab.value">
                <div class="m-pvx-fb-data-group">
                    <ul class="u-pvx-fb-data-list">
                        <li class="u-pvx-fb-list-item" v-for="(item, i) in currentGroup" :key="i">
                            <label class="u-pvx-fb-list-label">{{ item.name }}</label>
                            <span class="u-pvx-fb-list-value">{{ item.value }}</span>
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
    name: "BodyData",
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
            let data;
            try {
                data = JSON.parse(sessionStorage.getItem("bodyData"));
            } catch (e) {
                sessionStorage.removeItem("bodyData");
            }
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
};
</script>

<style lang="less">
@import "~@/assets/css/body/data.less";

.slide-bar {
    // !important: 覆写 @jx3box/jx3box-facedat 组件内部样式，该组件未暴露样式定制接口
    background-color: rgb(107, 82, 255) !important;
}
</style>
