<script>
const ROLE_COLORS = ["#47777d", "#ad5149", "#ad8b42", "#6f638e"];
const CROSS_COLORS = {
    commonCompleted: "#5f8a78",
    primaryOnly: "#47777d",
    secondaryOnly: "#ad8b42",
    commonIncomplete: "#ad5149",
};

export default {
    name: "AchievementCompareAnalysis",
    props: {
        roles: {
            type: Array,
            default: () => [],
        },
        crossStatistics: {
            type: Array,
            default: () => [],
        },
        categories: {
            type: Array,
            default: () => [],
        },
    },
    computed: {
        hasDetailedComparison() {
            return this.roles.length >= 2;
        },
        crossItems() {
            return this.crossStatistics.map((item) => ({
                ...item,
                color: CROSS_COLORS[item.key] || "#8b918e",
                label: this.getCrossLabel(item.key),
            }));
        },
        weakCategories() {
            return this.categories.slice(0, 7);
        },
        radarCategories() {
            return this.categories.slice(0, 8);
        },
        radarGridPolygons() {
            return [1, 0.75, 0.5, 0.25].map((ratio) => this.polygonPoints(ratio));
        },
        radarAxes() {
            return this.radarCategories.map((category, index) => {
                const end = this.polarPoint(index, this.radarCategories.length, 1);
                const label = this.polarPoint(index, this.radarCategories.length, 1.2);
                return {
                    id: category.id,
                    name: category.name,
                    end,
                    label,
                    anchor: label.x < 164 ? "end" : label.x > 176 ? "start" : "middle",
                };
            });
        },
        radarSeries() {
            return this.roles.slice(0, 4).map((role, index) => {
                const roleId = String(role.id || role.jx3id);
                const points = this.radarCategories
                    .map((category, categoryIndex) => {
                        const progress = category.roleProgress.find((item) => item.roleId === roleId)?.pointProgress;
                        return this.polarPoint(
                            categoryIndex,
                            this.radarCategories.length,
                            Math.max(0, Math.min(1, Number(progress || 0) / 100))
                        );
                    })
                    .map((point) => `${point.x},${point.y}`)
                    .join(" ");
                return {
                    roleId,
                    name: role.name || "—",
                    color: ROLE_COLORS[index],
                    points,
                };
            });
        },
    },
    methods: {
        formatNumber(value) {
            const locale = typeof this.$i18n?.locale === "string" ? this.$i18n.locale : undefined;
            return new Intl.NumberFormat(locale).format(Number(value) || 0);
        },
        formatPercent(value) {
            return value === null || value === undefined ? "—" : `${Number(value).toFixed(1)}%`;
        },
        roleColor(index) {
            return ROLE_COLORS[index % ROLE_COLORS.length];
        },
        polarPoint(index, total, ratio) {
            if (!total) return { x: 170, y: 145 };
            const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total;
            const radius = 104 * ratio;
            return {
                x: Number((170 + Math.cos(angle) * radius).toFixed(2)),
                y: Number((145 + Math.sin(angle) * radius).toFixed(2)),
            };
        },
        polygonPoints(ratio) {
            return this.radarCategories
                .map((category, index) => this.polarPoint(index, this.radarCategories.length, ratio))
                .map((point) => `${point.x},${point.y}`)
                .join(" ");
        },
        getCrossLabel(key) {
            const primary = this.roles[0]?.name || "—";
            const secondary = this.roles[1]?.name || "—";
            if (key === "primaryOnly") {
                return this.$t("pages.wiki.compare.ui.workbench.crossPrimaryOnly", { role: primary });
            }
            if (key === "secondaryOnly") {
                return this.$t("pages.wiki.compare.ui.workbench.crossSecondaryOnly", { role: secondary });
            }
            return this.$t(`pages.wiki.compare.ui.workbench.${key}`);
        },
    },
};
</script>

<template>
    <details class="m-compare-analysis">
        <summary>
            <span>{{ $t("pages.wiki.compare.ui.workbench.analysisSeal") }}</span>
            <strong>{{ $t("pages.wiki.compare.ui.workbench.analysisTitle") }}</strong>
            <small>{{ $t("pages.wiki.compare.ui.workbench.analysisHint") }}</small>
        </summary>

        <div class="m-compare-analysis__body">
            <section class="m-compare-analysis-card is-full">
                <div class="m-compare-analysis-title">
                    <h3>{{ $t("pages.wiki.compare.ui.workbench.totalComparison") }}</h3>
                    <span>{{ $t("pages.wiki.compare.ui.workbench.totalComparisonHint") }}</span>
                </div>
                <div class="m-compare-total-bars">
                    <div v-for="(role, index) in roles" :key="role.id || role.jx3id">
                        <span>{{ role.name || "—" }}</span>
                        <div>
                            <i :style="{ width: `${role.pointProgress || 0}%`, background: roleColor(index) }"></i>
                        </div>
                        <b>{{ formatNumber(role.completedPoints) }}</b>
                    </div>
                </div>
            </section>

            <template v-if="hasDetailedComparison">
                <section class="m-compare-analysis-card is-full">
                    <div class="m-compare-analysis-title">
                        <h3>{{ $t("pages.wiki.compare.ui.workbench.crossTitle") }}</h3>
                        <span>{{ $t("pages.wiki.compare.ui.workbench.crossHint") }}</span>
                    </div>
                    <div class="m-compare-cross-grid">
                        <article v-for="item in crossItems" :key="item.key">
                            <strong :style="{ color: item.color }">{{ formatNumber(item.count) }}</strong>
                            <span>{{ item.label }}</span>
                            <small>{{ formatNumber(item.points) }} · {{ formatPercent(item.percentage) }}</small>
                        </article>
                    </div>
                    <div class="m-compare-segment" aria-hidden="true">
                        <span
                            v-for="item in crossItems"
                            :key="item.key"
                            :style="{ width: `${item.percentage}%`, background: item.color }"
                        ></span>
                    </div>
                </section>

                <section class="m-compare-analysis-card">
                    <div class="m-compare-analysis-title">
                        <h3>{{ $t("pages.wiki.compare.ui.workbench.structureTitle") }}</h3>
                    </div>
                    <div v-if="radarCategories.length >= 3" class="m-compare-radar">
                        <svg
                            viewBox="0 0 340 300"
                            role="img"
                            :aria-label="$t('pages.wiki.compare.ui.workbench.structureTitle')"
                        >
                            <polygon
                                v-for="(points, index) in radarGridPolygons"
                                :key="`grid-${index}`"
                                :points="points"
                                fill="none"
                                stroke="rgba(70, 74, 66, 0.13)"
                            />
                            <line
                                v-for="axis in radarAxes"
                                :key="`axis-${axis.id}`"
                                x1="170"
                                y1="145"
                                :x2="axis.end.x"
                                :y2="axis.end.y"
                                stroke="rgba(70, 74, 66, 0.12)"
                            />
                            <polygon
                                v-for="series in radarSeries"
                                :key="series.roleId"
                                :points="series.points"
                                :fill="`${series.color}22`"
                                :stroke="series.color"
                                stroke-width="2"
                            />
                            <text
                                v-for="axis in radarAxes"
                                :key="`label-${axis.id}`"
                                :x="axis.label.x"
                                :y="axis.label.y"
                                :text-anchor="axis.anchor"
                            >
                                {{ axis.name }}
                            </text>
                        </svg>
                        <div class="m-compare-radar-legend">
                            <span v-for="series in radarSeries" :key="`legend-${series.roleId}`">
                                <i :style="{ background: series.color }"></i>{{ series.name }}
                            </span>
                        </div>
                    </div>
                </section>

                <section class="m-compare-analysis-card">
                    <div class="m-compare-analysis-title">
                        <h3>{{ $t("pages.wiki.compare.ui.workbench.weakTitle") }}</h3>
                        <span>{{ $t("pages.wiki.compare.ui.workbench.weakHint") }}</span>
                    </div>
                    <div class="m-compare-weak-list">
                        <article v-for="category in weakCategories" :key="category.id">
                            <span>{{ category.name }}</span>
                            <div>
                                <i
                                    v-for="(progress, index) in category.roleProgress.slice(0, 4)"
                                    :key="progress.roleId"
                                >
                                    <b
                                        :style="{
                                            width: `${progress.pointProgress || 0}%`,
                                            background: roleColor(index),
                                        }"
                                    ></b>
                                </i>
                            </div>
                            <strong>{{ formatPercent(category.averageProgress) }}</strong>
                        </article>
                    </div>
                </section>
            </template>

            <section v-else class="m-compare-analysis-card is-full m-compare-analysis-empty">
                {{ $t("pages.wiki.compare.ui.workbench.needTwoRoles") }}
            </section>
        </div>
    </details>
</template>

<style lang="less" scoped>
.m-compare-analysis {
    overflow: hidden;
    border: 1px solid rgba(70, 74, 66, 0.14);
    border-radius: 12px;
    background: rgba(255, 254, 250, 0.86);

    > summary {
        display: flex;
        min-height: 52px;
        align-items: center;
        gap: 9px;
        padding: 10px 15px;
        color: #52605e;
        cursor: pointer;
        list-style: none;

        &::-webkit-details-marker {
            display: none;
        }

        > span {
            display: inline-flex;
            width: 25px;
            height: 25px;
            align-items: center;
            justify-content: center;
            border-radius: 7px;
            color: #fff;
            background: #47777d;
            font-size: 12px;
        }

        strong {
            font-size: 13px;
        }

        small {
            color: #9ca29f;
            font-size: 10px;
        }
    }
}

.m-compare-analysis__body {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    padding: 0 12px 12px;
}

.m-compare-analysis-card {
    min-width: 0;
    padding: 14px;
    border: 1px solid rgba(70, 74, 66, 0.11);
    border-radius: 10px;
    background: rgba(249, 247, 241, 0.72);

    &.is-full {
        grid-column: 1 / -1;
    }
}

.m-compare-analysis-title {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 13px;

    h3 {
        margin: 0;
        color: #3e4a49;
        font-size: 13px;
    }

    span {
        color: #9ba19e;
        font-size: 10px;
    }
}

.m-compare-total-bars {
    display: grid;
    gap: 9px;

    > div {
        display: grid;
        grid-template-columns: 92px minmax(0, 1fr) 70px;
        align-items: center;
        gap: 10px;
        font-size: 11px;

        > span {
            overflow: hidden;
            color: #65706e;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        > div {
            height: 9px;
            overflow: hidden;
            border-radius: 999px;
            background: rgba(70, 74, 66, 0.08);

            i {
                display: block;
                height: 100%;
                border-radius: inherit;
            }
        }

        > b {
            color: #4e5a59;
            font-size: 11px;
            text-align: right;
        }
    }
}

.m-compare-cross-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;

    article {
        padding: 10px;
        border: 1px solid rgba(70, 74, 66, 0.09);
        border-radius: 8px;
        background: rgba(255, 255, 252, 0.66);
        text-align: center;

        strong,
        span,
        small {
            display: block;
        }

        strong {
            font-size: 20px;
        }

        span {
            margin-top: 2px;
            color: #66716f;
            font-size: 10px;
        }

        small {
            margin-top: 5px;
            color: #a0a5a2;
            font-size: 9px;
        }
    }
}

.m-compare-segment {
    display: flex;
    height: 9px;
    overflow: hidden;
    margin-top: 12px;
    border-radius: 999px;
    background: rgba(70, 74, 66, 0.08);
}

.m-compare-radar {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    svg {
        width: min(100%, 420px);
        height: auto;
    }

    text {
        fill: #7d8582;
        font-size: 9px;
    }
}

.m-compare-radar-legend {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 9px;
    color: #777f7c;
    font-size: 10px;

    span {
        display: inline-flex;
        align-items: center;
        gap: 4px;
    }

    i {
        width: 7px;
        height: 7px;
        border-radius: 50%;
    }
}

.m-compare-weak-list {
    display: grid;
    gap: 9px;

    article {
        display: grid;
        grid-template-columns: 74px minmax(0, 1fr) 44px;
        align-items: center;
        gap: 8px;
        color: #65706e;
        font-size: 10px;

        > span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        > div {
            display: grid;
            gap: 3px;
        }

        i {
            display: block;
            height: 4px;
            overflow: hidden;
            border-radius: 999px;
            background: rgba(70, 74, 66, 0.08);

            b {
                display: block;
                height: 100%;
                border-radius: inherit;
            }
        }

        > strong {
            color: #4e5a59;
            text-align: right;
        }
    }
}

.m-compare-analysis-empty {
    color: #969d99;
    font-size: 12px;
    text-align: center;
}

@media (max-width: 800px) {
    .m-compare-analysis__body {
        grid-template-columns: minmax(0, 1fr);
    }

    .m-compare-analysis-card.is-full {
        grid-column: auto;
    }

    .m-compare-cross-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 480px) {
    .m-compare-analysis > summary small {
        display: none;
    }

    .m-compare-total-bars > div {
        grid-template-columns: 68px minmax(0, 1fr) 58px;
    }
}
</style>
