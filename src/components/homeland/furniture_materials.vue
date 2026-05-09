<template>
    <div class="m-pvx-furniture-materials" v-loading="loading">
        <div class="u-material-list" v-if="materials.length">
            <div class="u-material-item" v-for="(item, i) in materials" :key="i">
                <img class="u-icon" :src="getIcon(item)" :alt="item.name" />
                <span class="u-name">{{ item.name }}</span>
                <span class="u-count">x{{ item.count }}</span>
            </div>
        </div>
        <el-empty v-else description="暂无合成材料数据" :image-size="60"></el-empty>
    </div>
</template>

<script>
/**
 * @description 家具合成材料组件
 * @description 展示生活技能家具的合成材料列表
 * @author ymg
 * @version 1.0.0
 * 
 * @props
 * - id {Number|String} 物品 ID，用于获取合成材料数据
 * 
 * @example
 * <FurnitureMaterials :id="itemId" />
 * 
 * @notes
 * - 仅生活技能来源的家具显示此组件
 * - 材料数据通过 API 获取
 * - 显示材料图标、名称和数量
 */
import { getItemMaterials } from "@/service/furniture.js";
import { __ossRoot } from "@/utils/config";

export default {
    name: "FurnitureMaterials",
    props: {
        id: {
            type: [Number, String],
            required: true,
        },
    },
    data() {
        return {
            loading: false,
            materials: [],
        };
    },
    methods: {
        getIcon(item) {
            return __ossRoot + "image/item/" + item.icon + ".png";
        },
        loadMaterials() {
            if (!this.id) return;
            
            this.loading = true;
            getItemMaterials(this.id)
                .then((res) => {
                    this.materials = res.data || [];
                })
                .finally(() => {
                    this.loading = false;
                });
        },
    },
    watch: {
        id: {
            immediate: true,
            handler() {
                this.loadMaterials();
            },
        },
    },
};
</script>

<style lang="less">
.m-pvx-furniture-materials {
    padding: 10px 0;

    .u-material-list {
        .flex;
        flex-wrap: wrap;

        .u-material-item {
            .flex;
            align-items: center;
            .mr(20px);
            .mb(10px);
            padding: 8px 12px;
            background-color: #f5f7fa;
            .r(4px);

            .u-icon {
                .size(24px);
                .mr(8px);
            }

            .u-name {
                .fz(13px);
                .color(#333);
            }

            .u-count {
                .ml(5px);
                .fz(12px);
                .color(@pvx-color-primary);
                .bold;
            }
        }
    }
}
</style>
