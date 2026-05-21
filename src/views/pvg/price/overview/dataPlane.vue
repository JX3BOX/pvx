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
import { validateEChartsOption } from "@/utils/echarts-option-validator.js";

export default {
    name: "GoodsPrice",
    props: ["item"],
    components: {},
    data: function () {
        return {
            myChart: null,
            resizeHandle: null,
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
            this.myChart = echarts.init(this.$refs.chart);
            const resizeHandle = () => {
                if (!this.myChart) return;
                try {
                    this.myChart.resize();
                } catch (e) {
                    console.error('图表resize失败：', e);
                }
            };
            window.addEventListener("resize", resizeHandle);
            this.resizeHandle = resizeHandle;
        },
        // 设置图表配置项
        setOption() {
            if (!this.myChart) return;
            if (!this.item.data || !this.item.data.length) return;
            const { beforeYesterday, yesterday, lastDay } = this.item;
            const data = [beforeYesterday, yesterday, lastDay].filter(function (v) { return v !== null && v !== undefined; });
            if (data.length === 0) return;
            const min = Math.min(...data);
            const max = Math.max(...data);
            const option = {
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
            };
            const safeOption = validateEChartsOption(option);
            if (!safeOption) return;
            try {
                this.myChart.setOption(safeOption);
            } catch (error) {
                console.error('设置图表选项失败：', error);
            }
        },
    },
    beforeUnmount() {
        if (this.resizeHandle) {
            window.removeEventListener("resize", this.resizeHandle);
            this.resizeHandle = null;
        }
        if (this.myChart) {
            this.myChart.dispose();
            this.myChart = null;
        }
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
