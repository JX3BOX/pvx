<template>
    <div class="marquee-wrap" ref="marqueeWrap">
        <div class="scroll" ref="scroll">
            <span class="marquee" ref="marquee">{{ text }}</span>
            <span class="copy" ref="copy"></span>
        </div>
    </div>
</template>

<script>
export default {
    name: "marquee",
    props: ["showText"],
    data() {
        return {
            timer: null,
            text: "",
        };
    },
    created() {
        let timer = setTimeout(() => {
            this.move();
            clearTimeout(timer);
        }, 1000);
    },
    mounted() {
        for (let item of this.showText) {
            this.text += item;
        }
    },
    methods: {
        move() {
            let wrapWidth = this.$refs.marqueeWrap.clientWidth;
            let textWidth = this.$refs.marquee.scrollWidth;
            if (textWidth <= wrapWidth) return;
            let scroll = this.$refs.scroll;
            let copy = this.$refs.copy;
            copy.innerText = this.text;
            let distance = 0;
            this.timer = setInterval(() => {
                distance -= 1;
                if (-distance >= textWidth) {
                    distance = 0;
                }
                scroll.style.transform = "translateX(" + distance + "px)";
            }, 30);
        },
    },
    beforeUnmount() {
        clearInterval(this.timer);
    },
};
</script>

<style scoped>
.marquee-wrap {
    width: 100%;
    overflow: hidden;
}
.scroll {
    display: flex;
    white-space: nowrap;
}
.marquee {
    flex-shrink: 0;
    padding-right: 0.16rem;
}
.copy {
    flex-shrink: 0;
    padding-right: 0.16rem;
}
</style>
