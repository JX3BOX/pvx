<template>
    <div v-loading="loading" class="space-y-3" :class="preview ? 'min-h-24' : 'min-h-48'">
        <div v-if="!preview && !requiresLogin && !loadError && rawEntries.length" class="flex flex-wrap gap-1.5">
            <button
                v-for="tab in domainTabs"
                :key="tab"
                type="button"
                class="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
                :class="
                    activeDomain === tab
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                "
                @click="activeDomain = tab"
            >
                {{ $t(tab ? `exterior.domains.${tab}` : "exterior.allTypes") }}
            </button>
        </div>

        <PvxEmptyState v-if="requiresLogin" :title="$t('exterior.star.loginRequired')">
            <template #action>
                <PvxActionButton @click="login">{{ $t("exterior.star.login") }}</PvxActionButton>
            </template>
        </PvxEmptyState>
        <PvxEmptyState v-else-if="loadError" :title="$t('exterior.loadError')" :description="loadError" illustrated>
            <template #action>
                <el-button @click="loadEntries">{{ $t("exterior.retry") }}</el-button>
            </template>
        </PvxEmptyState>
        <ol
            v-else-if="preview && entries.length"
            class="m-ext-podium"
        >
            <li v-for="(entry, index) in entries" :key="entryKey(entry)" class="min-w-0">
                <component
                    :is="entry.exterior ? 'router-link' : 'div'"
                    :to="entry.exterior ? { name: 'exterior-list', query: { id: entry.exterior.key } } : undefined"
                    class="m-ext-podium__card"
                >
                    <div class="m-ext-podium__art">
                        <ExteriorDomainBadge v-if="entry.exterior" :item="entry.exterior" />
                        <img v-if="entryThumb(entry)" :src="entryThumb(entry)" alt="" />
                        <Trophy v-else aria-hidden="true" />
                    </div>
                    <div class="m-ext-podium__caption">
                        <span class="m-ext-podium__rank"><Trophy aria-hidden="true" />{{ index + 1 }}</span>
                        <strong :title="entry.exterior?.name">
                            <span
                                v-for="(part, partIndex) in podiumNameParts(entry.exterior?.name || $t('exterior.star.unavailable'))"
                                :key="partIndex"
                                class="m-ext-podium__name-part"
                            >{{ part.prefix }}<span class="m-ext-podium__name-ending">{{ part.ending }}</span></span>
                        </strong>
                        <span class="m-ext-podium__count">{{ $t("exterior.star.count", { count: entry.count }) }}</span>
                    </div>
                </component>
            </li>
        </ol>
        <component
            :is="isFavorites ? 'ul' : 'ol'"
            v-else-if="entries.length"
            class="m-0 list-none divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white p-0"
        >
            <li
                v-for="(entry, index) in entries"
                :key="entryKey(entry)"
                class="grid items-center gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-slate-50 focus-within:bg-slate-50 sm:gap-3 sm:px-4"
                :class="isFavorites ? 'grid-cols-[minmax(0,1fr)_auto]' : 'grid-cols-[1.5rem_minmax(0,1fr)_auto]'"
            >
                <span
                    v-if="!isFavorites"
                    class="grid size-6 place-items-center rounded-full text-xs leading-none font-semibold tabular-nums"
                    :class="rankColors[index] || 'bg-slate-100 text-slate-500'"
                >
                    {{ index + 1 }}
                </span>
                <router-link
                    v-if="entry.exterior"
                    :to="{ name: 'exterior-list', query: { id: entry.exterior.key, view: $route.query.id ? $route.query.view : view } }"
                    @click.left.exact="$emit('select')"
                    class="flex min-w-0 items-center gap-2.5 rounded-lg font-medium text-slate-700 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-500"
                >
                    <img
                        v-if="entryThumb(entry)"
                        :src="entryThumb(entry)"
                        alt=""
                        class="size-10 shrink-0 rounded-lg border border-slate-100 bg-slate-100 object-cover object-top"
                    />
                    <span class="min-w-0 flex-1">
                        <span class="flex items-center gap-1.5 leading-5 wrap-anywhere">
                            <span
                                v-if="isFavorites && entry.pinned"
                                class="inline-flex shrink-0 items-center rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700"
                            >
                                {{ $t("exterior.star.pin") }}
                            </span>
                            <span>{{ entry.exterior.name }}</span>
                        </span>
                        <span v-if="domainLabel(entry)" class="mt-0.5 block text-xs text-slate-400">
                            {{ domainLabel(entry) }}
                        </span>
                    </span>
                </router-link>
                <div v-else class="min-w-0">
                    <p class="m-0 break-all font-semibold text-slate-700">{{ entryKey(entry) }}</p>
                    <p class="m-0 text-xs text-slate-500">{{ $t("exterior.star.unavailable") }}</p>
                </div>
                <div v-if="isFavorites" class="flex shrink-0 items-center">
                    <el-button
                        circle
                        plain
                        :type="entry.pinned ? 'warning' : 'default'"
                        :title="$t(entry.pinned ? 'exterior.star.unpin' : 'exterior.star.pin')"
                        :aria-label="$t(entry.pinned ? 'exterior.star.unpin' : 'exterior.star.pin')"
                        :loading="pinning.has(entryKey(entry))"
                        @click="togglePin(entry)"
                    >
                        <template #icon><Top aria-hidden="true" /></template>
                    </el-button>
                    <el-button
                        circle
                        plain
                        type="primary"
                        :title="$t('exterior.star.removeNamed', { name: entry.exterior?.name || entryKey(entry) })"
                        :aria-label="$t('exterior.star.removeNamed', { name: entry.exterior?.name || entryKey(entry) })"
                        :loading="removing.has(entryKey(entry))"
                        @click="remove(entryKey(entry))"
                    >
                        <template #icon><StarFilled aria-hidden="true" /></template>
                    </el-button>
                </div>
                <span
                    v-else
                    class="inline-flex min-w-11 items-center justify-center gap-1 rounded-full bg-slate-100 px-2 py-1 whitespace-nowrap text-xs font-medium tabular-nums text-slate-600"
                    :title="$t('exterior.star.count', { count: entry.count })"
                >
                    <StarFilled class="size-3 text-indigo-500" aria-hidden="true" />
                    <span aria-hidden="true">{{ entry.count }}</span>
                    <span class="sr-only">{{ $t("exterior.star.count", { count: entry.count }) }}</span>
                </span>
            </li>
        </component>
        <PvxEmptyState
            v-else-if="!loading"
            :title="$t(`exterior.star.${isFavorites ? 'emptyFavorites' : 'emptyRanking'}`)"
            illustrated
        />
    </div>
</template>

<script>
import { ElMessage } from "element-plus";
import { StarFilled, Top, Trophy } from "@element-plus/icons-vue";
import User from "@jx3box/jx3box-common/js/user";
import { iconLink } from "@jx3box/jx3box-common/js/utils";
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import ExteriorDomainBadge from "./ExteriorDomainBadge.vue";
import { DOMAIN_META, pickExteriorCover } from "@/components/exterior/meta";
import {
    getExteriorStars,
    getExteriorStarRanking,
    removeExteriorStar,
    updateExteriorStar,
} from "@/service/exterior";

const PREVIEW_LIMIT = 3;

export default {
    name: "ExteriorStarList",
    components: { ExteriorDomainBadge, PvxActionButton, PvxEmptyState, StarFilled, Top, Trophy },
    emits: ["ranking-loaded", "select"],
    props: {
        view: { type: String, required: true },
        preview: Boolean,
        visible: { type: Boolean, default: false },
    },
    data() {
        return {
            rankColors: ["bg-rose-100 text-rose-700", "bg-amber-100 text-amber-800", "bg-indigo-100 text-indigo-700"],
            domainTabs: ["", "bundle", "outfit", "hair", "pendant", "weapon"],
            activeDomain: "",
            rawEntries: [],
            removing: new Set(),
            pinning: new Set(),
            requiresLogin: false,
            loading: false,
            loadError: "",
            requestId: 0,
        };
    },
    computed: {
        isFavorites() {
            return this.view === "favorites";
        },
        activeRole() {
            return this.$store.state.preferredRole || 2;
        },
        entries() {
            if (!this.activeDomain) return this.rawEntries;
            return this.rawEntries.filter((entry) => entry.exterior?.domain === this.activeDomain);
        },
    },
    watch: {
        visible: {
            immediate: true,
            handler(visible) {
                if (visible) this.loadEntries();
            },
        },
    },
    beforeUnmount() {
        this.requestId++;
    },
    methods: {
        iconLink,
        podiumNameParts(name) {
            return name.split("·").map((segment, index) => {
                const letters = Array.from(segment);
                return {
                    prefix: (index ? "·" : "") + letters.slice(0, -2).join(""),
                    ending: letters.slice(-2).join(""),
                };
            });
        },
        entryKey(entry) {
            return entry.exterior_key || entry.exterior_id || entry.exterior?.key || "";
        },
        entryThumb(entry) {
            const cover = pickExteriorCover(entry.exterior?.images, this.activeRole);
            if (cover) return cover;
            if (Number(entry.exterior?.icon_id) > 0) {
                return iconLink(entry.exterior.icon_id, this.$store.state.client);
            }
            return "";
        },
        domainLabel(entry) {
            const domain = entry.exterior?.domain;
            return DOMAIN_META[domain] ? this.$t(`exterior.domains.${domain}`) : domain || "";
        },
        login() {
            User.toLogin();
        },
        errorMessage(error) {
            const { code, msg } = error.response?.data || error.data || { code: error.code, msg: error.message };
            return msg ? (code ? `[${code}] ${msg}` : msg) : this.$t("exterior.requestError");
        },
        updatePreview(entries) {
            this.requestId++;
            this.rawEntries = entries.slice(0, PREVIEW_LIMIT);
            this.loading = false;
            this.loadError = "";
        },
        async loadEntries() {
            const requestId = ++this.requestId;
            if (!this.preview) this.rawEntries = [];
            this.loadError = "";
            this.requiresLogin = this.isFavorites && !User.isLogin();
            this.loading = !this.requiresLogin;
            if (this.requiresLogin) return;
            try {
                const entries = await (this.isFavorites ? getExteriorStars() : getExteriorStarRanking({ limit: this.preview ? PREVIEW_LIMIT : 30 }));
                if (requestId !== this.requestId) return;
                this.rawEntries = entries;
                if (!this.isFavorites && !this.preview) this.$emit("ranking-loaded", entries);
            } catch (error) {
                if (requestId === this.requestId) this.loadError = this.errorMessage(error);
            } finally {
                if (requestId === this.requestId) this.loading = false;
            }
        },
        async togglePin(entry) {
            const key = this.entryKey(entry);
            if (!key || this.pinning.has(key)) return;
            this.pinning.add(key);
            try {
                const nextPinned = !entry.pinned;
                await updateExteriorStar(key, { pinned: nextPinned });
                entry.pinned = nextPinned;
                this.rawEntries = [...this.rawEntries].sort(
                    (a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))
                );
            } catch (error) {
                ElMessage.error(this.errorMessage(error));
            } finally {
                this.pinning.delete(key);
            }
        },
        async remove(key) {
            if (!key || this.removing.has(key)) return;
            if (!User.isLogin()) {
                this.login();
                return;
            }
            this.removing.add(key);
            try {
                await removeExteriorStar(key);
                this.rawEntries = this.rawEntries.filter((entry) => this.entryKey(entry) !== key);
                if (this.loading && this.visible) this.loadEntries();
            } catch (error) {
                ElMessage.error(this.errorMessage(error));
            } finally {
                this.removing.delete(key);
            }
        },
    },
};
</script>

<style scoped lang="less">
@import (reference) "~@/assets/css/design-system/_tokens.less";

.m-ext-podium {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);
    gap: @pvx-space-3;
    min-width: 0;
    margin: 0;
    padding: var(--podium-inset);
    list-style: none;

    @media (max-width: @ipad-y) {
        grid-auto-columns: min(100%, 420px);
        overflow-x: auto;
        padding-bottom: @pvx-space-1;
        scroll-snap-type: x proximity;

        li { scroll-snap-align: start; }
    }
}

.m-ext-podium__card {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    box-sizing: border-box;
    height: var(--podium-card-height);
    overflow: hidden;
    border: 1px solid @pvx-border;
    border-radius: @pvx-radius-card;
    background: @pvx-surface-muted;
    box-shadow: @pvx-shadow-xs;
    text-decoration: none;
    transition: transform 0.22s @pvx-ease-standard, box-shadow 0.22s @pvx-ease-standard, border-color 0.22s;

    &:any-link:hover,
    &:focus-visible {
        border-color: @pvx-border-focus;
        box-shadow: @pvx-shadow-hover;

        .m-ext-podium__caption strong {
            color: @pvx-primary-hover;
        }

        @media (prefers-reduced-motion: no-preference) {
            transform: translateY(-3px);

            .m-ext-podium__art img {
                transform: scale(1.04);
            }
        }
    }
}

.m-ext-podium__art {
    position: relative;
    display: grid;
    min-height: 0;
    overflow: hidden;
    place-items: center;
    background: url("~@/assets/img/exterior/card-bg.webp") center / cover;

    img {
        width: 100%;
        height: 100%;
        min-height: 0;
        object-fit: contain;
        transition: transform 0.3s @pvx-ease-standard;
    }

    svg { width: 42px; color: @pvx-text-muted; }
}

.m-ext-podium__caption {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: @pvx-space-1;
    padding: 10px 14px;

    strong {
        display: -webkit-box;
        width: 100%;
        overflow: hidden;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        text-wrap: balance;
        overflow-wrap: anywhere;
        color: @pvx-text-primary;
        font-size: clamp(16px, 1.25vw, 20px);
        line-height: 1.4;
        transition: color 0.18s;
    }
}

.m-ext-podium__name-part {
    display: inline-block;
    max-width: 100%;
    vertical-align: top;
}

.m-ext-podium__name-ending {
    white-space: nowrap;
}

@media (max-width: @ipad-y) {
    .m-ext-podium__card {
        grid-template-columns: minmax(0, 44fr) minmax(0, 56fr);
    }

    .m-ext-podium__caption {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: 26px auto 20px;
        align-content: center;
        align-items: center;
        justify-items: start;
        padding-inline: 10px;
        font-size: 16px;

        strong { font-size: inherit; }
    }
}

.m-ext-podium__rank {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: @pvx-radius-pill;
    background: #fef3c7;
    color: #92400e;
    font-weight: 700;

    svg { width: 16px; }
}

.m-ext-podium li:nth-child(2) .m-ext-podium__rank { background: #e2e8f0; color: #475569; }
.m-ext-podium li:nth-child(3) .m-ext-podium__rank { background: #ffedd5; color: #9a3412; }
.m-ext-podium__count { color: @pvx-text-secondary; font-size: 13px; }
</style>
