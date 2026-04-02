<template>
    <div class="c-facedat" v-if="ready && group_tabs">
        <div class="c-facedat-tab">
            <el-radio-group v-model="active">
                <el-radio-button
                    v-for="tab in Object.values(group_tabs)"
                    :key="tab.value"
                    class="u-filter"
                    :label="tab.value"
                >
                    {{ tab.label }}
                </el-radio-button>
            </el-radio-group>
            <slot></slot>
        </div>

        <template v-for="tab in Object.values(group_tabs)" :key="tab.value">
            <div class="c-facedat-preivew" v-show="active === tab.value">
                <div class="c-facedat-group">
                    <ul class="u-list">
                        <li v-for="(item, i) in currentGroup" :key="i">
                            <label>{{ item.name }}</label>
                            <span>{{ item.value }}</span>
                            <Slider
                                class="u-range"
                                :min="item.min"
                                :max="item.max"
                                v-model="body_data.tBody[item.key]"
                                :disabled="lock"
                            />
                        </li>
                    </ul>
                </div>
            </div>
        </template>

        <div class="c-facedat-btns">
            <el-button class="u-btn" type="primary" @click="buildData" :disabled="!body_data">
                <el-icon><Download /></el-icon>
                导出正式服
            </el-button>
        </div>
    </div>
</template>

<script>
import _ from "lodash";
import { dump } from "@jx3box/jx3box-facedat/src/BodyConverter";
import { saveAs } from "file-saver";
import group_tabs from "@jx3box/jx3box-facedat/assets/data/body/body_group_tabs.json";
import group_fields from "@jx3box/jx3box-facedat/assets/data/body/body_group_fields.json";
import types from "@jx3box/jx3box-facedat/assets/data/index.json";
import field_range from "@jx3box/jx3box-facedat/assets/data/body/body_fields_reverse.json";
import Slider from "@jx3box/jx3box-facedat/src/Slider.vue";

export default {
    name: "Bodydat",
    props: ["data", "lock", "tab_type"],
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
        currentFieldRanges() {
            return field_range[this.types[this.body_type].value];
        },
        currentGroupFields() {
            return this.group_fields[this.active];
        },
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
            if (!this.data) {
                this.body_data = "";
                this.body_type = "";
                return;
            }

            try {
                const body_data = this.data.object;
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
        buildData() {
            if (!this.body_data) return;
            const outputWithHeader = dump(_.cloneDeep(this.body_data));
            const blob = new Blob([outputWithHeader], { type: "application/dat;charset=utf-8" });
            saveAs(blob, Date.now() + ".dat");
        },
    },
};
</script>

<style lang="less">
@import "~@jx3box/jx3box-facedat/assets/css/facedat.less";
</style>
