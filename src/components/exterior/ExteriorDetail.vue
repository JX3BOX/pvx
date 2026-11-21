<template>
    <div class="m-exterior-detail">
        <PvxSurface tag="header" padding="medium" class="m-exterior-heading">
            <div class="m-exterior-heading__info">
                <img :src="iconLink(item.icon_id, client)" alt="" class="size-11 shrink-0 rounded-xl" />
                <div class="min-w-0">
                    <ul v-if="item.tags?.length" class="m-exterior-tags">
                        <li v-for="tag in item.tags" :key="tag">{{ tag }}</li>
                    </ul>
                    <h1 class="m-exterior-title">{{ item.name }}</h1>
                </div>
            </div>
            <PvxActionButton
                v-if="!item.local_preview"
                variant="light"
                :class="{ 'm-exterior-heading__action': starred }"
                :disabled="starBusy"
                :aria-busy="starBusy"
                @click="toggleStar"
            >
                <component :is="starred ? 'StarFilled' : 'Star'" class="size-4 shrink-0" aria-hidden="true" />
                {{ $t(starLabel) }}
            </PvxActionButton>
        </PvxSurface>

        <PvxSurface padding="medium" class="m-exterior-detail-grid">
            <section class="m-exterior-preview-card">
                <div class="m-exterior-preview-toolbar">
                    <h2 class="m-exterior-block-title">{{ $t("exterior.preview") }}</h2>
                    <el-radio-group
                        v-if="canPreviewModel"
                        v-model="previewMode"
                        size="small"
                        :aria-label="$t('exterior.preview')"
                    >
                        <el-radio-button value="image">{{ $t("exterior.staticPreview") }}</el-radio-button>
                        <el-radio-button value="model">{{ $t("exterior.modelPreview") }}</el-radio-button>
                    </el-radio-group>
                </div>
                <div
                    v-if="previewMode === 'model'"
                    class="m-exterior-preview"
                    :aria-label="$t('exterior.modelPreview')"
                >
                    <slot name="preview-3d" :item="item" :body-type="cover?.body">
                        <ExteriorModelPreview v-if="!item.local_preview" :item="item" :initial-role="cover?.role" />
                    </slot>
                </div>
                <template v-else>
                    <div class="m-exterior-preview">
                        <el-image
                            v-if="cover"
                            :key="cover.url"
                            :src="cover.url"
                            :alt="item.name"
                            :preview-src-list="[cover.url]"
                            fit="contain"
                            preview-teleported
                            class="m-exterior-preview__image"
                        >
                            <template #error>
                                <div class="m-exterior-image-fallback">
                                    <img :src="iconLink(item.icon_id, client)" alt="" class="size-14 rounded-xl" />
                                    <span>{{ $t("exterior.imageUnavailable") }}</span>
                                </div>
                            </template>
                        </el-image>
                        <div v-else class="m-exterior-image-fallback">
                            <img :src="iconLink(item.icon_id, client)" alt="" class="size-14 rounded-xl" />
                            <span>{{ $t("exterior.imageUnavailable") }}</span>
                        </div>
                    </div>
                </template>
                <div
                    v-if="covers.length > 1"
                    class="m-exterior-cover-picker"
                    role="group"
                    :aria-label="$t('exterior.bodyType')"
                >
                    <el-button
                        v-for="entry in covers"
                        :key="entry.url"
                        size="small"
                        class="!m-0"
                        :type="entry === cover ? 'primary' : undefined"
                        :aria-pressed="entry === cover"
                        @click="selectedCover = entry.url"
                        >{{ entry.body ? $t(`exterior.bodyTypes.${entry.body}`) : entry.label }}</el-button
                    >
                </div>
            </section>

            <section class="grid min-w-0 gap-4">
                <h2 class="m-exterior-block-title">{{ $t("exterior.details") }}</h2>
                <dl class="m-exterior-fields">
                    <div class="u-exterior-field">
                        <dt>{{ $t("exterior.idLabel") }}</dt>
                        <dd>{{ item.key }}</dd>
                    </div>
                    <div v-if="prices.length" class="u-exterior-field">
                        <dt>{{ $t("exterior.price") }}</dt>
                        <dd class="m-exterior-prices">
                            <span v-for="price in prices" :key="price">{{ price }}</span>
                        </dd>
                    </div>
                </dl>
                <p v-if="description" class="m-exterior-description">{{ description }}</p>
                <section v-for="group in relatedGroups" :key="group.label" class="m-exterior-related">
                    <h3 class="m-0 text-sm font-semibold">{{ $t(group.label) }}</h3>
                    <div class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,180px),1fr))] gap-2">
                        <router-link
                            v-for="entry in group.items"
                            :key="entry.key"
                            :to="{ name: 'exterior-list', query: { id: entry.key, view: $route.query.view } }"
                            class="m-exterior-related-item"
                        >
                            <img :src="iconLink(entry.icon_id, client)" class="size-8 shrink-0 rounded-md" alt="" />
                            <span class="min-w-0 break-words">{{ entry.name || entry.key }}</span>
                        </router-link>
                    </div>
                </section>
            </section>
        </PvxSurface>

        <PvxSurface v-if="gallery.length" padding="medium" class="space-y-4">
            <PvxSectionHeader :title="$t('exterior.gallery')" />
            <div class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-3">
                <el-image
                    v-for="(url, index) in gallery"
                    :key="url"
                    :src="url"
                    :alt="item.name"
                    :preview-src-list="gallery"
                    :initial-index="index"
                    fit="cover"
                    lazy
                    preview-teleported
                    class="m-exterior-gallery-image"
                >
                    <template #error
                        ><div class="m-exterior-image-fallback">{{ $t("exterior.imageUnavailable") }}</div></template
                    >
                </el-image>
            </div>
        </PvxSurface>
        <slot name="showcase" :exterior-id="item.key" :item="item">
            <ExteriorShowcase v-if="item.local_preview" :exterior-id="item.key" />
        </slot>
    </div>
</template>

<script>
import ExteriorModelPreview from "./ExteriorModelPreview.vue";
import ExteriorShowcase from "./ExteriorShowcase.vue";
import { Star, StarFilled } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import User from "@jx3box/jx3box-common/js/user";
import { extractTextContent, iconLink } from "@jx3box/jx3box-common/js/utils";
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";

import {
    addExteriorStar,
    exteriorBodyTypes,
    getExteriorsDetail,
    isExteriorStarred,
    removeExteriorStar,
} from "@/service/exterior";

const relatedRequestLimit = 4;

export default {
    name: "ExteriorDetail",
    components: {
        ExteriorModelPreview,
        ExteriorShowcase,
        Star,
        StarFilled,
        PvxActionButton,
        PvxSectionHeader,
        PvxSurface,
    },
    props: { item: { type: Object, required: true } },
    data() {
        return {
            previewMode: "image",
            selectedCover: "",
            relatedDetails: {},
            relatedRequest: null,
            starred: null,
            starBusy: false,
            starStatusError: false,
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
        starLabel() {
            if (this.starred === null && this.starBusy) return "exterior.star.loading";
            if (this.starStatusError) return "exterior.star.retry";
            return this.starred ? "exterior.star.remove" : "exterior.star.add";
        },
        canPreviewModel() {
            return (
                this.item.local_preview || /^(outfit|part|hair|pendant|weapon|effect|posture)_\d+$/.test(this.item.key)
            );
        },
        covers() {
            return Object.entries(this.item.images.cover).map(([role, url]) => ({
                label: role,
                role: exteriorBodyTypes[role] ? Number(role) : undefined,
                url,
                body: exteriorBodyTypes[role],
            }));
        },
        cover() {
            return this.covers.find((entry) => entry.url === this.selectedCover) || this.covers[0];
        },
        gallery() {
            return [...new Set(Object.values(this.item.images.detail).flat())];
        },
        description() {
            const text = this.item.description;
            return text?.startsWith("<Text>")
                ? extractTextContent(text)
                      .map(({ text }) => text)
                      .join("")
                : text;
        },
        prices() {
            return [
                ...new Set(
                    this.item.prices.map(({ amount, currency }) =>
                        this.$t("exterior.priceAmount", { amount, currency })
                    )
                ),
            ];
        },
        relatedGroupKeys() {
            const included = new Set();
            const containing = new Set();
            const key = this.item.key;

            for (const { from_key, to_key, kind } of this.item.relations) {
                if (kind !== "contains" || from_key === to_key) continue;
                if (from_key === key) included.add(to_key);
                if (to_key === key) containing.add(from_key);
            }

            return [
                { label: "exterior.contents", keys: [...included] },
                { label: "exterior.containingOutfits", keys: [...containing] },
            ].filter(({ keys }) => keys.length);
        },
        relatedGroups() {
            return this.relatedGroupKeys.map(({ label, keys }) => ({
                label,
                items: keys.map((key) => this.relatedDetails[key] || { key }),
            }));
        },
    },
    created() {
        if (this.relatedGroupKeys.length) this.loadRelatedItems();
        if (!this.item.local_preview && User.isLogin()) this.loadStarStatus();
    },
    beforeUnmount() {
        this.relatedRequest?.abort();
    },
    methods: {
        iconLink,
        async loadStarStatus() {
            this.starBusy = true;
            this.starStatusError = false;
            try {
                this.starred = await isExteriorStarred(this.item.key);
            } catch (error) {
                this.starStatusError = true;
                this.showStarError(error);
            } finally {
                this.starBusy = false;
            }
        },
        async toggleStar() {
            if (this.starBusy) return;
            if (!User.isLogin()) {
                User.toLogin();
                return;
            }
            if (this.starred === null) {
                await this.loadStarStatus();
                return;
            }

            const nextStarred = !this.starred;
            this.starBusy = true;
            try {
                const updateStar = nextStarred ? addExteriorStar : removeExteriorStar;
                await updateStar(this.item.key);
                this.starred = nextStarred;
            } catch (error) {
                this.showStarError(error);
            } finally {
                this.starBusy = false;
            }
        },
        showStarError(error) {
            const data = error.response?.data || error.data;
            ElMessage.error(data?.msg || this.$t("exterior.requestError"));
        },
        async loadRelatedItems() {
            const controller = new AbortController();
            this.relatedRequest = controller;
            const { signal } = controller;
            const keys = [...new Set(this.relatedGroupKeys.flatMap((group) => group.keys))];

            for (let start = 0; start < keys.length; start += relatedRequestLimit) {
                const batch = keys.slice(start, start + relatedRequestLimit);
                const results = await Promise.allSettled(batch.map((key) => getExteriorsDetail(key, signal)));
                if (signal.aborted) return;

                for (const [index, result] of results.entries()) {
                    if (result.status === "fulfilled" && result.value) {
                        this.relatedDetails[batch[index]] = result.value;
                    }
                }
            }
        },
    },
};
</script>

<style lang="less" scoped>
@import (reference) "~@/assets/css/design-system/_tokens.less";

.m-exterior-detail {
    display: grid;
    min-width: 0;
    gap: @pvx-space-5;

    @media (max-width: @phone) {
        gap: @pvx-space-3;
    }
}

.m-exterior-heading {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: @pvx-space-3;

    @media (max-width: @phone) {
        grid-template-columns: minmax(0, 1fr);
    }
}

.m-exterior-heading__info {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: @pvx-space-2;
}

.m-exterior-heading__action {
    border-color: @pvx-primary;
    color: @pvx-primary;
    background: @pvx-primary-soft;

    @media (hover: hover) and (pointer: fine) {
        &:hover {
            color: @pvx-text-inverse;
            background: @pvx-primary;
        }
    }
}

.m-exterior-tags {
    display: flex;
    flex-wrap: wrap;
    gap: @pvx-space-1;
    margin: 0 0 @pvx-space-1;
    padding: 0;
    list-style: none;

    li {
        padding: 3px @pvx-space-1;
        border: 1px solid @pvx-border-focus;
        border-radius: @pvx-radius-pill;
        color: @pvx-primary-hover;
        background: @pvx-primary-soft;
        font-size: 12px;
        font-weight: 700;
        overflow-wrap: anywhere;
    }
}

.m-exterior-title {
    margin: 0;
    color: @pvx-text-primary;
    font-size: 32px;
    font-weight: 750;
    line-height: 1.3;
    overflow-wrap: anywhere;

    @media (max-width: @phone) {
        font-size: 26px;
    }
}

.m-exterior-detail-grid {
    display: grid;
    grid-template-columns: minmax(0, clamp(320px, 32%, 420px)) minmax(0, 1fr);
    gap: @pvx-space-5;
    align-items: start;

    @media (max-width: @ipad-y) {
        grid-template-columns: minmax(0, 1fr);
    }
}

.m-exterior-block-title {
    margin: 0;
    color: @pvx-text-primary;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.5;
}

.m-exterior-preview-card {
    display: grid;
    min-width: 0;
    overflow: hidden;
    border: 1px solid @pvx-border;
    border-radius: @pvx-radius-control;
    background: @pvx-surface;
}

.m-exterior-preview-toolbar,
.m-exterior-cover-picker {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: @pvx-space-1;
    padding: @pvx-space-2;
}

.m-exterior-preview-toolbar {
    justify-content: space-between;
}

.m-exterior-cover-picker {
    justify-content: center;
}

.m-exterior-preview {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-height: clamp(240px, 46vh, 420px);
    border-block: 1px solid @pvx-border-light;
    background: linear-gradient(@pvx-surface-muted, @pvx-primary-soft);
}

.m-exterior-preview__image {
    width: 100%;
    height: clamp(240px, 46vh, 420px);
}

.m-exterior-gallery-image {
    aspect-ratio: 4 / 3;
    width: 100%;
    border: 1px solid @pvx-border;
    border-radius: @pvx-radius-small;
    background: @pvx-surface-muted;
}

.m-exterior-image-fallback {
    display: grid;
    height: 100%;
    place-content: center;
    justify-items: center;
    gap: @pvx-space-1;
    color: @pvx-text-secondary;
    font-size: 14px;
}

.m-exterior-fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
    gap: @pvx-space-2;
    margin: 0;
}

.u-exterior-field,
.m-exterior-description,
.m-exterior-related-item {
    min-width: 0;
    padding: 10px @pvx-space-2;
    border: 1px solid @pvx-border-light;
    border-radius: @pvx-radius-small;
    color: @pvx-text-regular;
    background: @pvx-surface-muted;
    font-size: 14px;
    line-height: 1.7;
    overflow-wrap: anywhere;
}

.u-exterior-field {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    column-gap: @pvx-space-1;

    dt {
        color: @pvx-text-secondary;
        font-weight: 600;
    }

    dd {
        min-width: 0;
        margin: 0;
    }
}

.m-exterior-prices {
    display: flex;
    flex-wrap: wrap;
    gap: 4px @pvx-space-1;

    span {
        padding: 0 @pvx-space-1;
        border-radius: @pvx-radius-pill;
        color: @pvx-primary-hover;
        background: @pvx-primary-soft;
        font-weight: 600;
    }
}

.m-exterior-description {
    margin: 0;
    white-space: pre-line;
}

.m-exterior-related {
    display: grid;
    gap: @pvx-space-1;
    padding-top: @pvx-space-3;
    border-top: 1px solid @pvx-border-light;
}

.m-exterior-related-item {
    display: flex;
    align-items: center;
    gap: @pvx-space-1;

    @media (hover: hover) and (pointer: fine) {
        &:hover {
            border-color: @pvx-border-focus;
            color: @pvx-primary-hover;
        }
    }
}
</style>
