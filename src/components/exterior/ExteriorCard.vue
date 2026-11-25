<!-- 外观列表卡片：透明外观渲染图叠加柔和古风纹理底图，底部左侧展示物品小图标与名称、常用俗称。 -->
<template>
    <router-link :to="{ name: 'exterior-list', query: { id: item.key } }" class="m-ext-card group">
        <div class="m-ext-card__stage">
            <ExteriorDomainBadge v-if="showDomainBadge" :item="item" />
            <span v-if="statusBadge" class="m-ext-card__status" :class="`is-${statusBadge.tone}`">
                {{ statusBadge.label }}
            </span>

            <el-image
                v-if="coverUrl"
                :key="coverUrl"
                :src="coverUrl"
                :alt="item.name"
                lazy
                fit="contain"
                class="m-ext-card__img"
            >
                <template #placeholder>
                    <div class="m-ext-card__loading" aria-hidden="true" />
                </template>
                <template #error>
                    <div class="m-ext-card__fallback">
                        <template v-if="itemIconUrl">
                            <div class="m-ext-card__fallback-medallion">
                                <img :src="itemIconUrl" alt="" loading="lazy" class="m-ext-card__fallback-icon" />
                            </div>
                            <span class="m-ext-card__fallback-hint">{{ $t("exterior.imageUnavailable") }}</span>
                        </template>
                        <span v-else class="m-ext-card__fallback-text">{{ $t("exterior.imageUnavailable") }}</span>
                    </div>
                </template>
            </el-image>

            <div v-else class="m-ext-card__fallback">
                <template v-if="itemIconUrl">
                    <div class="m-ext-card__fallback-medallion">
                        <img :src="itemIconUrl" alt="" loading="lazy" class="m-ext-card__fallback-icon" />
                    </div>
                    <span class="m-ext-card__fallback-hint">{{ $t("exterior.imageUnavailable") }}</span>
                </template>
                <span v-else class="m-ext-card__fallback-text">{{ $t("exterior.imageUnavailable") }}</span>
            </div>
        </div>

        <div class="m-ext-card__body">
            <div class="m-ext-card__title-row">
                <img v-if="itemIconUrl" :src="itemIconUrl" alt="" loading="lazy" class="m-ext-card__icon" />
                <h3 class="m-ext-card__name">{{ item.name || item.game_name || item.key }}</h3>
            </div>
            <p v-if="primaryAlias" class="m-ext-card__alias" :title="allAliasesText">
                {{ primaryAlias }}
            </p>
        </div>
    </router-link>
</template>

<script>
import { iconLink } from "@jx3box/jx3box-common/js/utils";
import ExteriorDomainBadge from "./ExteriorDomainBadge.vue";
import { pickExteriorCover } from "./meta";

export default {
    name: "ExteriorCard",
    components: { ExteriorDomainBadge },
    props: {
        item: { type: Object, required: true },
        role: { type: Number, default: 2 },
        showDomainBadge: { type: Boolean, default: false },
    },
    computed: {
        hasIcon() {
            return Number(this.item.icon_id) > 0;
        },
        itemIconUrl() {
            return this.hasIcon ? iconLink(this.item.icon_id, this.$store.state.client) : "";
        },
        coverUrl() {
            return pickExteriorCover(this.item.images, this.role);
        },
        statusBadge() {
            const tags = this.item.game_tags || this.item.tags || [];
            if (tags.includes("out_of_print")) return { label: this.$t("exterior.labels.discontinued"), tone: "rose" };
            if (tags.includes("limited")) return { label: this.$t("exterior.labels.limited"), tone: "amber" };
            if (this.item.tradable_item) return { label: this.$t("exterior.tradableYes"), tone: "emerald" };
            return null;
        },
        primaryAlias() {
            const aliases = this.item.aliases || [];
            if (!aliases.length) return "";
            const name = (this.item.name || "").trim();
            const distinct = aliases.filter((a) => a && a.trim() !== name);
            if (!distinct.length) return "";
            return distinct.slice(0, 2).join(" · ");
        },
        allAliasesText() {
            return (this.item.aliases || []).join(" / ");
        },
    },
};
</script>

<style lang="less" scoped>
@import (reference) "~@/assets/css/design-system/_tokens.less";

.m-ext-card {
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
    border: 1px solid rgba(226, 232, 240, 0.9);
    border-radius: @pvx-radius-card;
    background: @pvx-surface;
    color: @pvx-text-primary;
    text-decoration: none;
    box-shadow: @pvx-shadow-xs;
    transition: transform 0.22s @pvx-ease-standard, box-shadow 0.22s @pvx-ease-standard, border-color 0.22s;

    &:hover,
    &:focus-visible {
        border-color: @pvx-border-focus;
        box-shadow: @pvx-shadow-hover;
        transform: translateY(-3px);

        .m-ext-card__img {
            transform: scale(1.04);
        }

        .m-ext-card__name {
            color: @pvx-primary-hover;
        }
    }
}

.m-ext-card__stage {
    position: relative;
    aspect-ratio: 3 / 4;
    width: 100%;
    overflow: hidden;
    background: url("~@/assets/img/exterior/card-bg.webp") center / cover no-repeat,
        radial-gradient(circle at 50% 42%, #f5f7fc 0%, #e4e9f5 100%);
    border-bottom: 1px solid rgba(226, 232, 240, 0.75);
}

.m-ext-card__status {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 2;
    padding: 3px 9px;
    border-radius: @pvx-radius-pill;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.3;
    backdrop-filter: blur(6px);
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);

    &.is-rose {
        color: #be123c;
        background: rgba(255, 241, 242, 0.92);
    }

    &.is-amber {
        color: #b45309;
        background: rgba(255, 251, 235, 0.92);
    }

    &.is-emerald {
        color: #047857;
        background: rgba(236, 253, 245, 0.92);
    }
}

.m-ext-card__img {
    width: 100%;
    height: 100%;
    padding: 10px 8px 4px;
    box-sizing: border-box;
    transition: transform 0.3s @pvx-ease-standard;

    :deep(img) {
        filter: drop-shadow(0 8px 14px rgba(30, 41, 59, 0.14));
    }
}

.m-ext-card__loading {
    width: 100%;
    height: 100%;
    background: linear-gradient(
        110deg,
        rgba(255, 255, 255, 0) 35%,
        rgba(255, 255, 255, 0.45) 50%,
        rgba(255, 255, 255, 0) 65%
    );
    background-size: 220% 100%;
    animation: ext-shimmer 1.4s infinite linear;
}

@keyframes ext-shimmer {
    0% {
        background-position: 120% 0;
    }
    100% {
        background-position: -120% 0;
    }
}

.m-ext-card__fallback {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    height: 100%;
}

.m-ext-card__fallback-medallion {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.78);
    border: 1px solid rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(8px);
    box-shadow: 0 10px 24px rgba(30, 41, 59, 0.1);
}

.m-ext-card__fallback-icon {
    width: 52px;
    height: 52px;
    border-radius: 11px;
    object-fit: cover;
}

.m-ext-card__fallback-hint {
    font-size: 11px;
    color: #64748b;
    padding: 2px 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.72);
}

.m-ext-card__fallback-text {
    font-size: 12px;
    color: @pvx-text-secondary;
}

.m-ext-card__body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 14px 13px;

    @media (max-width: @phone) {
        padding: 8px;
        .m-ext-card__name {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            white-space: normal;
            overflow-wrap: anywhere;
        }
    }
    background: @pvx-surface;
}

.m-ext-card__title-row {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
}

.m-ext-card__icon {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    object-fit: cover;
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
}

.m-ext-card__name {
    margin: 0;
    min-width: 0;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    color: @pvx-text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.18s;
}

.m-ext-card__alias {
    margin: 0;
    font-size: 12px;
    line-height: 1.35;
    color: @pvx-text-secondary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
