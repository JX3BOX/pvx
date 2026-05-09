<template>
    <div class="m-pvx-furniture-set">
        <div class="u-set-info">
            <div class="u-set-name">{{ data.szName }}</div>
            <div class="u-set-desc" v-if="data.szDesc">{{ data.szDesc }}</div>
        </div>
        <div class="u-set-items" v-if="items.length">
            <div
                class="u-set-item"
                v-for="(item, i) in items"
                :key="i"
                @click="goDetail(item)"
            >
                <img class="u-item-icon" :src="formatImg(item.Path)" :alt="item.szName" />
                <span class="u-item-name" :class="'quality_' + item.Quality">{{ item.szName }}</span>
            </div>
        </div>
    </div>
</template>

<script>
/**
 * @description 家具套装组件
 * @description 展示家具套装信息和套装内所有家具列表
 * @author ymg
 * @version 1.0.0
 * 
 * @props
 * - data {Object} 套装数据对象，包含 szName, szDesc, Items 等字段
 * 
 * @example
 * <FurnitureSet :data="setData" />
 * 
 * @notes
 * - 显示套装名称、描述和家具列表
 * - 点击家具项跳转到对应家具详情页
 * - 家具名称根据品质显示不同颜色
 */
import { formatFurnitureImg } from "@/utils/homeland";

export default {
    name: "FurnitureSet",
    props: {
        data: {
            type: Object,
            required: true,
        },
    },
    inject: ["__imgRoot"],
    computed: {
        items() {
            return this.data?.Items || [];
        },
    },
    methods: {
        formatImg(link) {
            return formatFurnitureImg(link, this.__imgRoot);
        },
        goDetail(item) {
            this.$router.push({
                name: "single",
                params: { id: item.ID },
            });
        },
    },
};
</script>

<style lang="less">
.m-pvx-furniture-set {
    .u-set-info {
        .mb(15px);

        .u-set-name {
            .fz(16px);
            .bold;
            .color(#333);
            .mb(5px);
        }

        .u-set-desc {
            .fz(13px);
            .color(#666);
            line-height: 1.6;
        }
    }

    .u-set-items {
        .flex;
        flex-wrap: wrap;

        .u-set-item {
            .flex;
            align-items: center;
            .mr(15px);
            .mb(10px);
            padding: 8px 12px;
            background-color: #f5f7fa;
            .r(4px);
            .pointer;
            transition: all 0.2s ease;

            &:hover {
                background-color: #e8f4ff;
            }

            .u-item-icon {
                .size(32px);
                .mr(8px);
                .r(4px);
            }

            .u-item-name {
                .fz(13px);

                &.quality_2 {
                    color: @pvx-quality-2;
                }
                &.quality_3 {
                    color: @pvx-quality-3;
                }
                &.quality_4 {
                    color: @pvx-quality-4;
                }
                &.quality_5 {
                    color: @pvx-quality-5;
                }
            }
        }
    }
}
</style>
