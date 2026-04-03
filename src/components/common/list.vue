<template>
    <div class="m-common-list--v2">
        <slot></slot>
        <div
            class="m-replace"
            :style="{ height: height + 'px' }"
            @click="update"
        >
            <img svg-inline src="@/assets/img/common/replace.svg" />
        </div>
    </div>
</template>

<script>
export default {
    name: "commonList",
    props: ["data"],
    emits: ["update:load"],
    data: function () {
        return {
            number: 0,
        };
    },
    computed: {
        color() {
            return this.data?.color || "";
        },
        height() {
            return this.data?.height || 0;
        },
        type() {
            return this.data?.type;
        },
    },
    methods: {
        update() {
            this.$emit("update:load", this.type);
        },
    },
};
</script>

<style lang="less">
.m-common-list--v2 {
    .flex;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    .m-replace {
        .pointer;
        .flex;
        .w(110px);
        justify-content: center;
        align-items: center;
        flex-shrink: 0;

        svg {
            transition: 0.3s ease-out;
            fill: #E1E1E1;
        }

        &:hover svg {
            fill: #786CBB;
        }
    }
    .m-common-list {
        .flex;
        .w(100%);
        gap: 20px;
    }
    &.search {
        .m-replace {
            .none;
        }
    }
}
@media screen and (max-width: @phone) {
    .m-common-list--v2 {
        ::-webkit-scrollbar {
            display: none;
        }
        .m-common-list {
            padding: 5px;
        }
        .m-replace {
            .none;
        }
    }
}
</style>
