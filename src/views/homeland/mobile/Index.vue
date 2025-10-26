<template>
<div class="p-mobile-homeland_index">
    <div class="m-homeland_list">
        <div class="u-item" v-for="item in tabs" :key="item.value" @click="onTabClick(item.value)">
            <div class="u-title">{{item.label}}</div>
            <div class="u-img">
                <img src="@/assets/img/homeland/jyinfo.svg" v-if="item.value==0" svg-inline style="width: 100%;"/>
                <img src="@/assets/img/homeland/jymap.svg" v-if="item.value==1" svg-inline  style="width: 100%;"/>
            </div>
        </div>
    </div>
</div>
</template>
<script>
export default {
    name: "Index",
    data() {
        return {
            tabs: [
                {
                    label: "家园信息",
                    value: 0,
                },
                {
                    label: "家园地图",
                    value: 1,
                },
            ],
        };
    },
    methods: {
        onTabClick(val) {
            if (val == 0) {
                this.$router.push("/tutorial");
            }
            if (val == 1) {
                this.$router.push("/maps");
            }
        }
    }
};
</script>
<style scoped lang="less">
.p-mobile-homeland_index {
    .m-homeland_list {
        padding: 1.25rem;
        box-sizing: border-box;
        .h(100vh);
        .u-item {
            .r(0.25rem);
            .h(4.625rem);
            .flex;
            padding: 0.5rem 0.75rem;
            justify-content: space-between;
            background: rgba(28, 28, 28, 0.05);
            margin-bottom: 0.5rem;
            .pr;
            .u-title{
                .fz(1rem,1.5rem);
                .bold(700);
            }
            .u-img{
                .w(3rem);
                .pa;
                .rb(0.5rem)
            }
        }
    }
}
//@media screen and (width: 414.4px)
@media (prefers-color-scheme: dark)
{
    .p-mobile-homeland_index{
        background: #000;
        .m-homeland_list{
            .u-item{
                background: rgba(255, 255, 255, 0.1);
                .u-title{
                    color: #fff;
                }
                .u-img{
                    svg{
                        fill: #fff;
                    }
                }
            }
        }
    }
}
</style>
