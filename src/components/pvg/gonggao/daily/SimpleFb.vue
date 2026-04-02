<template>
    <div class="m-simple-fb">
        <div class="m-fb-item" :class="item.isDone && 'is-done'" v-for="(item, index) in list" :key="index">
            <div class="u-fb-name">{{ item.name }}</div>
            <img
                class="u-done-icon"
                svg-inline
                src="@/assets/img/pvg/gonggao/check.svg"
                :fill="item.isDone ? '#fff' : '#949494'"
            />
        </div>
    </div>
</template>

<script>
export default {
    name: "SimpleFb",
    props: {
        list: {
            type: Array,
            required: true,
        },
    },
};
</script>
