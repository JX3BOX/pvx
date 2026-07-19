<template>
    <div class="u-data-plane">
        <div class="plane-header">
            <div class="plane-data">
                <div class="data-value">{{ item.recommend || 0 }}</div>
                <div class="data-label">{{ $t("pages.pvg.price.ui.chart.recommended") }}</div>
            </div>
            <div class="plane-channel">{{ item.name }}</div>
        </div>
        <div class="plane-chart" ref="chart" />
        <div class="plane-xAxis">
            <div class="xAxis-item">
                <div class="xAxis-value">{{ item.beforeYesterday || 0 }}</div>
            </div>
            <div class="xAxis-item">
                <div class="xAxis-value">{{ item.yesterday || 0 }}</div>
            </div>
            <div class="xAxis-item">
                <div class="xAxis-value">{{ item.lastDay || 0 }}</div>
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
            isDarkModeStatus: window.matchMedia("(prefers-color-scheme: dark)").matches,
            resizeHandle: null,
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
                    data: [
                        this.$t("pages.pvg.price.ui.chart.dayBefore"),
                        this.$t("pages.pvg.price.ui.chart.yesterday"),
                        this.$t("pages.pvg.price.ui.chart.today"),
                    ],
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
                            color: this.isDarkModeStatus ? "#fedaa3" : "#24292E",
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
@Brand-2: #24292e;
@Brand-2-dark: #fedaa3;
@Brand-4: #fff;
@Brand-4-dark: #282828;
@black-40: rgba(28, 28, 28, 0.4);
@black-40-dark: rgba(255, 255, 255, 0.4);
.u-data-plane {
    .flex;
    .r(10px);
    .size(100%);
    flex-direction: column;
    box-sizing: border-box;
    padding: 20px;
    user-select: none;
    gap: 20px;
    background-color: @Brand-4;

    * {
        box-sizing: border-box;
    }
    .plane-header {
        .flex;
        .size(100%,46px);
        justify-content: space-between;

        .plane-data {
            display: flex;
            flex-direction: column;
            font-weight: 700;
            .data-value {
                font-size: 24px;
                color: @Brand-2;
            }
            .data-label {
                .fz(14px,20px);
                color: @black-40;
            }
        }
        .plane-channel {
            color: @black-40;
            font-size: 14px;
            font-weight: 700;
            line-height: 20px;
            padding-top: 5px;
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
            color: @black-40;
            font-size: 10px;
            &:last-child {
                color: @Brand-2;
            }
        }
    }
}
@media (prefers-color-scheme: dark) {
    .u-data-plane {
        background-color: @Brand-4-dark;
        .plane-header {
            .plane-data {
                .data-value {
                    color: @Brand-2-dark;
                }
                .data-label {
                    color: @black-40-dark;
                }
            }
            .plane-channel {
                color: @black-40-dark;
            }
        }
        .plane-xAxis {
            .xAxis-item {
                color: @black-40-dark;
                &:last-child {
                    color: @Brand-2-dark;
                }
            }
        }
    }
}
</style>
