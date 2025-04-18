<template>
    <div class="m-manufacture-menu">
        <div class="m-craft-types">
            <div
                class="m-craft-type-item"
                v-for="(item, index) in craftTypes"
                :key="index"
                @click="$emit('go-recipe', { craft_type: item.key })"
            >
                <span>{{ item.name }}</span>
                <img class="u-icon is-light" svg-inline src="@/assets/img/manufacture/craft.svg" alt="" />
                <img class="u-icon is-dark" svg-inline src="@/assets/img/manufacture/craft_dark.svg" alt="" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    name: "ManufactureMenu",
    props: {
        craftTypes: {
            type: Array,
            default: () => [],
        },
    },
    data: () => ({}),
    computed: {},
    methods: {},
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
        width: calc(50% - 4px);

        box-sizing: border-box;
        .h(74px);
        .r(4px);
        .pr;
        padding: 8px 12px;
        background-color: var(--black-5);
        color: var(--black-80);

        .fz(12px, 18px);
        font-family: Microsoft YaHei UI;
        font-weight: 700;

        .u-icon {
            .size(48px);
            .pa;
            .rb(12px, 8px);

            @media (prefers-color-scheme: dark) {
                &.is-light {
                    display: none;
                }
            }
            @media (prefers-color-scheme: light) {
                &.is-dark {
                    display: none;
                }
            }
        }
    }
}
</style>
