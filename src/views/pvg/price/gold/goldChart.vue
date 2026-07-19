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
                        <div class="data-label">{{ $t("pages.pvg.price.ui.chart.dayBefore") }}</div>
                    </div>
                    <div>
                        <div class="data-value">{{ item.yesterday }}</div>
                        <div class="data-label">{{ $t("pages.pvg.price.ui.chart.yesterday") }}</div>
                    </div>
                    <div>
                        <div class="data-value">{{ item.lastDay }}</div>
                        <div class="data-label">{{ $t("pages.pvg.price.ui.chart.today") }}</div>
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
import { validateEChartsOption } from "@/utils/echarts-option-validator.js";
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
            resizeHandle: null,
            resizeObserver: null,
            loading: false,
            resizeTimer: null,
            hoverTimer: null,
            hasOption: false,
        };
    },
    computed: {
        // 当前渠道列表
        currentDataList() {
            const server = this.server; // 当前服务器
            const channelMap = this.goldPriceData[server];

            // 防御性检查：确保 channelMap 存在
            if (!channelMap) {
                return [];
            }

            let list = [];
            for (const key in channelMap) {
                const data = channelMap[key];

                // 防御性检查：确保数据数组存在且长度足够
                if (!Array.isArray(data) || data.length < 3) {
                    continue;
                }

                const lastDay = data[data.length - 1]?.average?.toFixed(2) || 0;
                const yesterday = data[data.length - 2]?.average?.toFixed(2) || 0;
                const beforeYesterday = data[data.length - 3]?.average?.toFixed(2) || 0;
                const sum = data.reduce((total, item) => total + (item?.average || 0), 0);
                const newItem = {
                    name: key === "WBL" ? this.$t("pages.pvg.price.ui.chart.channels.wbl") : key,
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
                    if (res.data && typeof res.data === 'object') {
                        this.goldPriceData = res.data;
                    } else {
                        console.error('获取金价数据失败：数据格式不正确');
                        this.goldPriceData = {};
                    }
                })
                .catch((error) => {
                    console.error('获取金价数据失败：', error);
                    this.goldPriceData = {};
                })
                .finally(() => {
                    this.loading = false;
                    this.$nextTick(() => {
                        // 只在图表未初始化时初始化
                        if (!this.myChart) {
                            this.initChart();
                        }
                        this.setOption();
                    });
                });
        },
        // 初始化自适应图表
        initChart() {
            // 如果已经初始化过，则清理后重新初始化
            if (this.myChart) {
                this.myChart.dispose();
                this.myChart = null;
            }

            // 确保 DOM 元素存在
            if (!this.$refs.chart || !this.$refs.chartBox) {
                return;
            }

            // 清理旧的监听器
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
                this.resizeObserver = null;
            }
            if (this.resizeHandle) {
                window.removeEventListener("resize", this.resizeHandle);
                this.resizeHandle = null;
            }

            // 创建实例
            this.myChart = echarts.init(this.$refs.chart);
            const myDiv = this.$refs.chartBox;
            const observer = new ResizeObserver(() => {
                this.chartResize();
            });
            observer.observe(myDiv);
            this.resizeObserver = observer;
            // 监听resize事件
            const resizeHandle = () => {
                this.chartResize();
            };
            // 监听resize事件
            window.addEventListener("resize", resizeHandle);
            this.resizeHandle = resizeHandle;
        },
        // 防抖
        chartResize() {
            if (!this.myChart || !this.hasOption) return;
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => {
                this.rebuildChart();
            }, 120);
        },
        rebuildChart() {
            if (!this.$refs.chart || !this.currentDataList.length) return;
            if (this.myChart) {
                this.myChart.dispose();
            }
            this.hasOption = false;
            this.myChart = echarts.init(this.$refs.chart);
            this.setOption();
        },
        heightLight(index) {
            if (!this.myChart || !this.hasOption) return;
            clearTimeout(this.hoverTimer);
            this.myChart.dispatchAction({
                type: "highlight",
                seriesIndex: index,
            });
        },
        // 取消高亮
        blur(index) {
            if (!this.myChart || !this.hasOption) return;
            this.hoverTimer = setTimeout(() => {
                if (this.myChart && this.hasOption) {
                    this.myChart.dispatchAction({
                        type: "downplay",
                        seriesIndex: index,
                    });
                }
            }, 100);
        },
        // 设置图表数据
        setOption() {
            const data = this.currentDataList;

            // 防御性检查：如果没有数据或图表未初始化，则不执行
            if (!this.myChart || !data || data.length === 0) {
                return;
            }

            const series = [];
            const dates = []; // 日期集合
            let minV = Infinity;
            let maxV = -Infinity;

            // 使用 forEach 而不是 for...in 来遍历数组
            data.forEach((channelData) => {
                const list = channelData.data || [];
                const key = channelData.key;

                // 跳过空数据
                if (!list || list.length === 0 || !key) {
                    return;
                }

                const seriesData = list
                    .filter((item) => item != null && Number.isFinite(Number(item.average)))
                    .map((item) => {
                        const value = Number(item.average);
                        const displayValue = Number(value.toFixed(2));
                        if (value > maxV) maxV = value;
                        if (value < minV) minV = value;
                        const date = item.date ? item.date.substring(5) : "";
                        dates.push(date);
                        return {
                            value: displayValue,
                            name: date,
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
                                name: this.$t("pages.pvg.price.ui.chart.maximum"),
                                label: {
                                    formatter: "{c}",
                                    fontSize: 10,
                                    color: "#fff",
                                },
                            },
                            {
                                type: "min",
                                name: this.$t("pages.pvg.price.ui.chart.minimum"),
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
                                name: this.$t("pages.pvg.price.ui.chart.average"),
                                label: {
                                    formatter: `${this.$t("pages.pvg.price.ui.chart.averageShort")} {c}`,
                                    color: this.colorMap[key],
                                },
                            },
                        ],
                    },
                });
            });

            // 如果没有有效的 series 数据，不执行后续操作
            if (series.length === 0) {
                return;
            }

            // 处理边界值
            if (!isFinite(minV)) minV = 0;
            if (!isFinite(maxV)) maxV = 100;
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
                        if (!params || params.length === 0) return '';
                        let str = `<span>${params[0].axisValue || ''}</span><br/>`;
                        str += `<span>${this.$t("pages.pvg.price.ui.server")}: ${this.server}</span><br/>`;
                        params.forEach((item) => {
                            if (item && item.data) {
                                let marker = this.getMarker(item.data.color);
                                str += `${marker} <span style="display:inline-block;width:50px">${item.seriesName || ''}</span>: ${item.value || ''}<br/>`;
                            }
                        });
                        return str;
                    },
                },
                series,
            };

            const safeOption = validateEChartsOption(option);
            if (!safeOption) return;
            try {
                this.hasOption = false;
                this.myChart.setOption(safeOption, true);
                this.hasOption = true;
            } catch (error) {
                this.hasOption = false;
                console.error("设置图表选项失败：", error);
                // 设置失败时销毁图表，防止后续 resize 在损坏状态下触发错误
                this.myChart.dispose();
                this.myChart = null;
            }
        },
        // get marker
        getMarker(color) {
            return `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>`;
        },
    },
    mounted() {
        this.getData();
    },
    beforeUnmount() {
        this.hasOption = false;
        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = null;
        }
        if (this.hoverTimer) {
            clearTimeout(this.hoverTimer);
            this.hoverTimer = null;
        }
        if (this.resizeHandle) {
            window.removeEventListener("resize", this.resizeHandle);
            this.resizeHandle = null;
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        if (this.myChart) {
            this.myChart.dispose();
            this.myChart = null;
        }
    },
};
</script>
