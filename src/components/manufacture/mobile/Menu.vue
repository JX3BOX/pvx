<template>
    <div class="m-manufacture-menu">
        <div class="m-craft-types">
            <button
                type="button"
                class="m-craft-type-item"
                :class="`is-${item.key}`"
                v-for="item in craftTypes"
                :key="item.key"
                @click="$emit('go-recipe', { craft_type: item.key })"
            >
                <span class="u-label">{{ getCraftName(item) }}</span>
                <span class="u-icon" aria-hidden="true">
                    <component :is="getCraftIcon(item.key)" />
                </span>
            </button>
        </div>
    </div>
</template>

<script>
import { FirstAidKit, House, KnifeFork, Scissor, Tools } from "@element-plus/icons-vue";

const CRAFT_ICONS = {
    tailoring: Scissor,
    cooking: KnifeFork,
    medicine: FirstAidKit,
    founding: Tools,
    furniture: House,
};

export default {
    name: "ManufactureMenu",
    props: {
        craftTypes: {
            type: Array,
            default: () => [],
        },
    },
    methods: {
        getCraftIcon(key) {
            return CRAFT_ICONS[key] || Tools;
        },
        getCraftName(item) {
            const path = `pages.pvg.manufacture.ui.crafts.${item.key}`;
            return this.$te(path) ? this.$t(path) : item.name;
        },
    },
};
</script>

<style lang="less">
.m-manufacture-menu {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .m-my-list {
        .pointer;
        padding: 8px 12px;
        .r(4px);
        .fz(12px, 18px);
        font-family: Microsoft YaHei UI;
        letter-spacing: 0%;
        font-weight: 700;

        background-color: var(--black-5);
        color: var(--Primary-Brand-2);
    }

    .m-craft-types {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: space-between;
    }

    .m-craft-type-item {
        .pointer;
        display: block;
        width: calc(50% - 4px);

        box-sizing: border-box;
        .h(74px);
        .r(4px);
        .pr;
        padding: 8px 12px;
        background-color: var(--black-5);
        color: var(--black-80);
        border: 0;
        text-align: left;
        font: inherit;

        .fz(12px, 18px);
        font-family: Microsoft YaHei UI;
        font-weight: 700;

        .u-icon {
            .size(48px);
            .pa;
            .rb(12px, 8px);

            display: flex;
            align-items: center;
            justify-content: center;

            svg {
                width: 100%;
                height: 100%;
            }
        }
    }
}
</style>
