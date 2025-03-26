<template>
    <el-dialog :visible.sync="visible" title="账单材料清单" width="520px" >
        <div class="m-materials-list">
            <el-table :data="data" border size="mini" max-height="480px">
                <el-table-column prop="Name" label="物品" width="180px">
                    <template #default="{ row }">
                        <div class="u-item">
                            <el-popover
                                popper-class="u-icon-popper"
                                placement="right"
                                :visible-arrow="false"
                                trigger="click"
                            >
                                <Item :item_id="row.id" />
                                <img
                                    slot="reference"
                                    :src="iconLink(row.item.item_info.IconID)"
                                    :alt="row.item.item_info.Name"
                                    style="cursor: pointer"
                                />
                            </el-popover>
                            <span class="u-title">
                                <span :class="`u-quality--${row.item.Quality}`">{{ row.item.item_info.Name }}</span>
                            </span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="count" label="数量" sortable width="80px" align="center"></el-table-column>
                <el-table-column prop="price" label="成本" sortable align="right" header-align="center">
                    <template #default="{ row }">
                        <div class="u-price-num">
                            <GamePrice :price="row.price" :align="true"></GamePrice>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <template v-slot:footer>
            <el-button type="primary" size="medium" @click="close">确认</el-button>
        </template>
    </el-dialog>
</template>

<script>
import Item from "@jx3box/jx3box-editor/src/Item.vue";
import GamePrice from "@jx3box/jx3box-common-ui/src/wiki/GamePrice.vue";
import { iconLink } from "@jx3box/jx3box-common/js/utils.js";

export default {
    name: "CartMaterials",
    components: { GamePrice, Item },
    props: ["materials"],
    data: function () {
        return {
            visible: false,
            data: [],
        };
    },
    methods: {
        iconLink,
        open(data) {
            this.visible = true;
            this.data = data;
        },
        close() {
            this.visible = false;
            this.data = [];
        },
    },
};
</script>

<style lang="less">
.m-materials-list {
    .el-table .cell {
        line-height: 1;
    }
    .u-item {
        .flex;
        gap: 8px;
        align-items: center;
        img {
            .size(24px, 24px);
        }
        .u-title {
            .fz(12px);
        }
    }
    .u-price-num {
        word-break: keep-all;
    }
    .c-game-price {
        .fz(12px);
    }
}
</style>
