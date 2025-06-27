<template>
    <!-- 跑马灯组件 -->
    <div class="marquee-wrap" ref="marquee-wrap">
        <div class="scroll" ref="scroll">
            <div class="marquee">{{text}}</div>
            <div class="copy" ref="copy"></div>
        </div>
        <div class="getWidth" ref="getWidth">{{text}}</div>
    </div>
</template>

<script>
export default {
    name: 'marquee',
    props: ['showText'],
    data () {
        return {
            timer: null,
            text: ''
        }
    },
    created () {
        let timer = setTimeout(() => {
            this.move()
            clearTimeout(timer)
        }, 1000)
    },
    mounted () {
        for (let item of this.showText) {
            this.text += item
        }
    },
    methods: {
        move () {
            let maxWidth = this.$refs['marquee-wrap'].clientWidth
            let width = this.$refs['getWidth'].scrollWidth
            if (width <= maxWidth) return
            let scroll = this.$refs['scroll']
            let copy = this.$refs['copy']
            copy.innerText = this.text
            let distance = 0
            this.timer = setInterval(() => {
                distance -= 1
                if (-distance >= width) {
                    distance = 16
                }
                scroll.style.transform = 'translateX(' + distance + 'px)'
            }, 30)
        }
    },
    beforeDestroy () {
        clearInterval(this.timer)
    }
}
</script>

<style scoped>
.marquee-wrap {
    width: 100%;
    overflow: hidden;
    position: relative;
}
.marquee{
    margin-right: 0.16rem;
}
p {
    word-break:keep-all;
    white-space: nowrap;

}
.scroll {
    display: flex;
}
.getWidth {
    word-break:keep-all;
    white-space:nowrap;
    position: absolute;
    opacity: 0;
    top: 0;
}
</style>
