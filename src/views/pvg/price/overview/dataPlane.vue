<template>
    <div class="u-data-plane" :style="{ background: colorMap[item.key] }" :class="{ noData: !item.key }">
        <div class="plane-header">
            <div class="plane-data">
                <div class="data-value">{{ item.recommend || 0 }}</div>
                <div class="data-label">建议价格</div>
            </div>
            <div class="plane-channel">{{ item.name }}</div>
        </div>
        <div class="plane-chart" ref="chart" />
        <div class="plane-xAxis">
            <div class="xAxis-item">
                <div class="xAxis-value">{{ item.beforeYesterday || 0 }}</div>
                <div class="xAxis-label">前日</div>
            </div>
            <div class="xAxis-item">
                <div class="xAxis-value">{{ item.yesterday || 0 }}</div>
                <div class="xAxis-label">昨日</div>
            </div>
            <div class="xAxis-item">
                <div class="xAxis-value">{{ item.lastDay || 0 }}</div>
                <div class="xAxis-label">今日</div>
            </div>
        </div>
    </div>
</template>

<script>
import * as echarts from "echarts";

export default {
    name: "GoodsPrice",
    props: ["item"],
    components: {},
    data: function () {
        return {
            myChart: null,
            colorMap: {
                WBL: "#F8B238",
                UU898: "#AA66FF",
                5173: "#5DA0ED",
                DD373: "#30C7C7",
                7881: "#FF768B",
            },
        };
    },
    watch: {
        item: {
            handler(value) {
                if (value.key) {
                    this.$nextTick(() => {
                        this.setOption();
                    });
                }
            },
            deep: true,
            immediate: true,
        },
    },
    methods: {
        // 初始化自适应图表
        initChart() {
            // 创建实例
            this.myChart = echarts.init(this.$refs.chart);
            // 监听resize事件
            const resizeHandle = () => {
                this.myChart.resize();
            };
            // 监听resize事件
            window.addEventListener("resize", resizeHandle);
            // 销毁实例
            this.$once("hook:beforeDestroy", () => {
                window.removeEventListener("resize", resizeHandle);
                this.myChart.dispose();
            });
        },
        // 设置图表配置项
        setOption() {
            if (!this.myChart) return;
            if (!this.item.data.length) return;
            const { beforeYesterday, yesterday, lastDay } = this.item;
            const data = [beforeYesterday, yesterday, lastDay];
            const min = Math.min(...data);
            const max = Math.max(...data);
            this.myChart.setOption({
                xAxis: {
                    show: false,
                    type: "category",
                    data: ["前日", "昨日", "今日"],
                    boundaryGap: false,
                },
                grid: {
                    left: 5,
                    right: 5,
                    bottom: 5,
                    top: 5,
                    // containLabel: true,
                },
                yAxis: {
                    show: false,
                    type: "value",
                    min,
                    max,
                },
                series: [
                    {
                        clip: false,
                        smooth: true,
                        data: data,
                        type: "line",
                        symbol: "none",
                        lineStyle: {
                            color: "#fff",
                            width: 5,
                            cap: "round",
                        },
                        silent: true,
                    },
                ],
            });
        },
    },
    created: function () {},
    mounted: function () {
        this.initChart();
    },
};
</script>

<style lang="less" scoped>
.u-data-plane {
    .flex;
    .r(10px);
    .size(480px,220px);
    flex-direction: column;
    box-sizing: border-box;
    padding: 20px;
    user-select: none;
    gap: 20px;

    * {
        box-sizing: border-box;
    }
    &.noData {
        background: #fff;
        .plane-header {
            .plane-data {
                color: #999;
                .data-value {
                    color: #999;
                }
            }
        }
    }
    .plane-header {
        .flex;
        .size(100%,46px);
        justify-content: space-between;

        .plane-data {
            display: flex;
            flex-direction: column;
            color: #fff;
            font-weight: 700;
            .data-value {
                font-size: 28px;
            }
            .data-label {
                .fz(14px,1.5);
            }
        }
        .plane-channel {
            color: #fff;
            font-size: 24px;
            font-weight: 700;
            line-height: 46px;
        }
    }
    .plane-chart {
        .size(100%,60px);
    }
    .plane-xAxis {
        .flex;
        justify-content: space-between;
        .xAxis-item {
            .flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: #fff;
            font-size: 14px;
            font-weight: 700;
        }
    }
}
</style>
