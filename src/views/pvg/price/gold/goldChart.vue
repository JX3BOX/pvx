<template>
    <div class="m-price-chart-box" ref="chartBox">
        <div class="legends">
            <div
                v-for="(item, index) in currentDataList"
                :key="index"
                :class="{ loading }"
                :style="{ background: colorMap[item.key] }"
                @mouseover="heightLight(index)"
                @mouseout="blur(index)"
                class="legends-item"
            >
                <div class="item-title">{{ item.name }}</div>

                <div class="item-data">
                    <div>
                        <div class="data-value">{{ item.beforeYesterday }}</div>
                        <div class="data-label">前日</div>
                    </div>
                    <div>
                        <div class="data-value">{{ item.yesterday }}</div>
                        <div class="data-label">昨日</div>
                    </div>
                    <div>
                        <div class="data-value">{{ item.lastDay }}</div>
                        <div class="data-label">今日</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="myChart" ref="chart"></div>
    </div>
</template>
<script>
import * as echarts from "echarts";
import { getGoldPriceData } from "@/service/pvg/price.js";
let timer;
export default {
    props: { server: {} },
    data() {
        return {
            goldPriceData: {},
            colorMap: {
                WBL: "#F8B238",
                UU898: "#AA66FF",
                5173: "#5DA0ED",
                DD373: "#30C7C7",
                7881: "#FF768B",
            },
            myChart: null,
        };
    },
    computed: {
        // 当前渠道列表
        currentDataList() {
            const server = this.server; // 当前服务器
            const channelMap = this.goldPriceData[server];
            let list = [];
            for (const key in channelMap) {
                const data = channelMap[key];
                const lastDay = data[data.length - 1].average.toFixed(2);
                const yesterday = data[data.length - 2].average.toFixed(2);
                const beforeYesterday = data[data.length - 3].average.toFixed(2);
                const sum = data.reduce((total, item) => total + item.average, 0);
                const newItem = {
                    name: key === "WBL" ? "万宝楼" : key,
                    key,
                    sum,
                    lastDay,
                    yesterday,
                    beforeYesterday,
                    data,
                };
                list.push(newItem);
            }
            list = list.sort((a, b) => b.sum - a.sum);
            return list;
        },
    },
    methods: {
        getData() {
            this.loading = true;
            getGoldPriceData()
                .then((res) => {
                    this.goldPriceData = res.data;
                })
                .finally(() => {
                    this.loading = false;
                    this.initChart();
                    this.setOption();
                });
        },
        // 初始化自适应图表
        initChart() {
            // 创建实例
            this.myChart = echarts.init(this.$refs.chart);
            const myDiv = this.$refs.chartBox;
            const observer = new ResizeObserver((entries) => {
                this.chartResize();
            });
            observer.observe(myDiv);
            // 监听resize事件
            const resizeHandle = () => {
                this.chartResize();
            };
            // 监听resize事件
            window.addEventListener("resize", resizeHandle);
            // 销毁实例
            this.$once("hook:beforeDestroy", () => {
                window.removeEventListener("resize", resizeHandle);
                observer.disconnect();
                this.myChart.dispose();
            });
        },
        // 防抖
        chartResize() {
            clearTimeout(timer);
            timer = setTimeout(() => {
                this.myChart.resize();
            }, 100);
        },
        heightLight(index) {
            clearTimeout(timer);
            this.myChart.dispatchAction({
                type: "highlight",
                seriesIndex: index,
            });
        },
        // 取消高亮
        blur(index) {
            timer = setTimeout(() => {
                this.myChart.dispatchAction({
                    type: "downplay",
                    seriesIndex: index,
                });
            }, 100);
        },
        // 设置图表数据
        setOption() {
            const series = [];
            const data = this.currentDataList;
            const dates = []; // 日期集合
            let minV = Infinity;
            let maxV = -Infinity;
            for (const channel in data) {
                const list = data[channel].data || [];
                const key = data[channel].key;
                const seriesData = list.map((item) => {
                    const value = item.average.toFixed(2);
                    if (value >= maxV) maxV = value;
                    if (value <= minV) minV = value;
                    const date = item.date.substring(5);
                    dates.push(date);
                    return {
                        value: value,
                        name: date, //
                        color: this.colorMap[key],
                    };
                });

                series.push({
                    name: key,
                    data: seriesData,
                    type: "line",
                    smooth: true,
                    symbol: "circle",
                    symbolSize: 10,
                    emphasis: {
                        // symbolSize: 15,
                    },
                    lineStyle: {
                        color: this.colorMap[key], // 线条颜色
                        width: 3,
                    },
                    itemStyle: {
                        color: this.colorMap[key], // 点的颜色
                    },

                    // 展示最高价、最低价、平均值
                    markPoint: {
                        symbolSize: 60,
                        data: [
                            {
                                type: "max",
                                name: "最高价",
                                label: {
                                    formatter: "{c}",
                                    fontSize: 10,
                                    color: "#fff",
                                },
                            },
                            {
                                type: "min",
                                name: "最低价",
                                label: {
                                    formatter: "{c}",
                                    fontSize: 10,
                                    color: "#fff",
                                },
                            },
                        ],
                    },
                    // 展示平均值
                    markLine: {
                        symbol: "none",
                        data: [
                            {
                                type: "average",
                                name: "平均价",
                                label: {
                                    formatter: "均价 {c}",
                                    color: this.colorMap[key],
                                },
                            },
                        ],
                    },
                });
            }
            minV = ~~(minV / 10) * 10;
            maxV = (~~(maxV / 10) + 1) * 10;

            const xAxisData = Array.from(new Set(dates)).sort(); // 根据日期集合得到横坐标
            const option = {
                xAxis: {
                    type: "category",
                    data: xAxisData,
                    boundaryGap: false,
                },
                yAxis: {
                    type: "value",
                    max: maxV,
                    min: minV,
                    interval: (maxV - minV) / 5, // 5段
                },
                grid: {
                    left: 20,
                    right: 90,
                    // bottom: 60,
                    containLabel: true,
                },
                dataZoom: [
                    {
                        type: "slider",
                        show: true,
                        xAxisIndex: [0],
                        start: 0,
                        end: 100,
                    },
                ],
                emphasis: { focus: "series" },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "cross",
                        label: {
                            backgroundColor: "#6a7985",
                        },
                    },
                    formatter: (params) => {
                        let str = `<span>${params[0].axisValue}</span><br/>`;
                        str += `<span>服务器: ${this.server}</span><br/>`;
                        params.forEach((item) => {
                            let marker = this.getMarker(item.data.color);
                            str += `${marker} <span style="display:inline-block;width:50px">${item.seriesName}</span>: ${item.value}<br/>`;
                        });
                        return str;
                    },
                },
                series,
            };
            this.myChart.resize();

            this.myChart.setOption(option, true);
        },
        // get marker
        getMarker(color) {
            return `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>`;
        },
    },
    mounted() {
        this.getData();
    },
};
</script>
<style lang="less">
.m-price-chart-box {
    .flex;
    flex-direction: column; 
    gap: 20px;
    .legends {
        .flex;
        .size(100%,108px);
        .scrollbar(2px);
        overflow-x: auto;
        overflow-y: hidden;
        gap: 20px;
        .legends-item {
            .flex; 
            .size(348px,98px);
            .r(10px);
            user-select: none;
            flex-shrink: 0;
            flex-direction: column;
            box-sizing: border-box;
            padding: 10px;
            gap: 10px;

            &.loading {
                background: #fff;
            }
            .item-title {
                .bold;
                .fz(24px);
                color: #fff;
                font-family: "Microsoft YaHei";
            }
            .item-data {
                .flex;
                flex-direction: row;
                justify-content: space-between;
                & > div {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 48px;
                    height: 34px;
                    .data-value,
                    .data-label {
                        color: #fff;
                        font-family: "Microsoft YaHei";
                        font-size: 14px;
                        font-weight: bold;
                        line-height: 18px;
                    }
                }
            }
        }
    }
    .myChart {
        .size(100%,760px);
        height: 760px;
        padding: 20px;
        background-color: #fff;
        border-radius: 10px;
    }
}

@media screen and (max-width: @phone) {
    .m-price-chart-box {
        flex-wrap: wrap;
        .legends {
            width: 100%;
            .legends-item {
                width: 100%;
            }
        }
    }
}
</style>
