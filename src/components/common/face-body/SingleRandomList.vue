<template>
    <div class="m-pvx-random__list">
        <div class="u-pvx-list m-pvx-single__content-box m-pvx-author__faces" v-if="list && list.length">
            <ListItem
                class="u-pvx-item"
                :type="type"
                :item="item"
                :noName="true"
                :variant="variant"
                v-for="item in list"
                :key="item.id"
            />
        </div>
    </div>
</template>

<script>
import ListItem from "@/components/common/face-body/ListItem.vue";

/**
 * SingleRandomList - 详情页随机推荐列表组件
 * 用于脸型/体型详情页展示作者其他作品推荐
 * 
 * 样式说明：
 * - 组件使用原有类名 m-random-list、u-list 等
 * - 样式由页面引入的 less 文件控制（body/single.less 或 face/single.less）
 * - 通过 face-body/index.less 中的 pvx-random-list-mixin 定义样式
 */
export default {
    name: "SingleRandomList",
    components: { ListItem },
    props: {
        // 列表数据
        list: {
            type: Array,
            default: () => [],
        },
        // 类型标识
        type: {
            type: String,
            default: "face",
            validator: (val) => ["face", "body"].includes(val),
        },
        variant: {
            type: String,
            default: "legacy",
            validator: (value) => ["legacy", "modern"].includes(value),
        },
    },
};
</script>
