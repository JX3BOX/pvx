<template>
    <div
        class="m-scroll-scene"
        :class="{
            'is-long-locale': isLongLocale,
            'is-interactive': enableDetailLinks,
        }"
        :style="{ zoom: contentZoom }"
        v-if="userAchievement"
    >
        <div class="m-closed-scroll" :class="{ start: addClass }" aria-hidden="true">
            <span class="u-closed-paper"></span>
            <img class="u-closed-left" :src="getCdnImgUrl('landscape/left.png')" />
            <img class="u-closed-right" :src="getCdnImgUrl('landscape/right.png')" />
        </div>
        <div
            class="m-content"
            :class="{
                start: addClass,
                over: isOver,
            }"
        >
            <img class="u-content__bg" :src="getCdnImgUrl('content_bg.png')" />
            <div class="m-left" :class="reelAddClass">
                <img class="u-left__img" :src="getCdnImgUrl('landscape/left.png')" />
            </div>
            <div class="m-right" :class="reelAddClass">
                <img class="u-right__img" :src="getCdnImgUrl('landscape/right.png')" />
            </div>
            <div class="m-qy-box">
                <!-- 普通奇遇 -->
                <div class="m-qy m-ordinary">
                    <div class="m-qy-list" v-if="userAchievement.normal.length">
                        <div class="m-qy__row" v-for="(ele, eleIndex) in userAchievement.normal" :key="eleIndex">
                            <component
                                :is="enableDetailLinks ? 'a' : 'div'"
                                class="m-qy__item u-treasure-adventure-link"
                                v-for="(item, index) in ele"
                                :key="index"
                                :href="enableDetailLinks ? getAdventureLink(item) : undefined"
                                :target="enableDetailLinks ? detailTarget : undefined"
                                :rel="enableDetailLinks && detailTarget === '_blank' ? 'noopener noreferrer' : undefined"
                                :aria-label="enableDetailLinks ? item.szName : undefined"
                            >
                                <template v-if="[4, 118].indexOf(item.dwID) > -1">
                                    <img
                                        v-show="currentCamp == 'hq'"
                                        class="u-qy__img"
                                        :src="getCdnImgUrl(`pt/${item.dwID}_hq.png`)"
                                    />
                                    <img
                                        v-show="currentCamp == 'er'"
                                        class="u-qy__img"
                                        :src="getCdnImgUrl(`pt/${item.dwID}_er.png`)"
                                    />
                                    <img
                                        v-show="!currentCamp"
                                        class="u-qy__img"
                                        :src="getCdnImgUrl(`pt/${item.dwID}.png`)"
                                    />
                                </template>
                                <el-image v-else class="u-qy__img" :src="getCdnImgUrl(`pt/${item.dwID}.png`)">
                                    <template #error>
                                        <img class="u-qy__img" :src="getCdnImgUrl(`pt/default.png`)" />
                                    </template>
                                </el-image>
                                <div class="m-qy__text">
                                    <img class="u-qy__bg" :src="getCdnImgUrl('pt/text_bg.png')" />
                                    <span class="u-qy__text">{{ item.szName }}</span>
                                </div>
                            </component>
                        </div>
                    </div>
                    <div class="u-no-qy" v-else>
                        <img :src="getCdnImgUrl('landscape/no_qy.png')" />
                    </div>
                    <div class="m-qy-count">
                        <img class="u-count__img" :src="getCdnImgUrl('landscape/pt_qy_bg.png')" />
                        <div class="m-count-info">
                            <div>{{ userAchievement.normalNowNum }}</div>
                            <div>/</div>
                            <div>{{ userAchievement.normalAllNum }}</div>
                        </div>
                    </div>
                </div>
                <!-- 宠物奇遇 -->
                <div class="m-qy m-pet">
                    <div class="m-qy-list" v-if="userAchievement.pet.length">
                        <div class="m-qy__row" v-for="(ele, eleIndex) in userAchievement.pet" :key="eleIndex">
                            <template v-if="enableDetailLinks">
                                <el-tooltip
                                    v-for="(item, index) in ele"
                                    :key="index"
                                    :content="item.szName"
                                    placement="top"
                                    :show-after="180"
                                >
                                    <a
                                        class="m-qy__item u-treasure-adventure-link u-treasure-pet-link"
                                        :href="getAdventureLink(item)"
                                        :target="detailTarget"
                                        :rel="detailTarget === '_blank' ? 'noopener noreferrer' : undefined"
                                        :aria-label="item.szName"
                                    >
                                        <img class="u-qy__img" :src="getImgUrl(item)" />
                                        <img class="u-qy__border" :src="getCdnImgUrl('pet_img_border.png')" />
                                    </a>
                                </el-tooltip>
                            </template>
                            <template v-else>
                                <div
                                    v-for="(item, index) in ele"
                                    :key="index"
                                    class="m-qy__item"
                                >
                                    <img class="u-qy__img" :src="getImgUrl(item)" />
                                    <img class="u-qy__border" :src="getCdnImgUrl('pet_img_border.png')" />
                                </div>
                            </template>
                        </div>
                    </div>
                    <div class="u-no-qy" v-else>
                        <img :src="getCdnImgUrl('landscape/no_qy.png')" />
                    </div>
                    <div class="m-qy-count">
                        <img class="u-count__img" :src="getCdnImgUrl('landscape/pet_qy_bg.png')" />
                        <div class="m-count-info">
                            <div>{{ userAchievement.petNowNum }}</div>
                            <div>/</div>
                            <div>{{ userAchievement.petAllNum }}</div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 绝世奇遇 -->
            <div class="m-world" :style="worldStageStyle">
                <img class="u-world__bg" :src="getCdnImgUrl(perfectLayout.worldBackground.src)" :style="worldBgStyle" />
                <div class="m-world-count" :style="perfectCountStyle">
                    <img
                        class="u-count__img"
                        :src="getCdnImgUrl(perfectLayout.countBadge)"
                        :style="perfectCountImageStyle"
                    />
                    <div class="m-count-info" :style="perfectCountTextStyle">
                        <template v-if="perfectLayout.countFormat === 'stack'">
                            <div>{{ userAchievement.perfectNowNum }}</div>
                            <div>/</div>
                            <div>{{ userAchievement.perfectAllNum }}</div>
                        </template>
                        <template v-else>
                            {{ userAchievement.perfectNowNum + "/" + userAchievement.perfectAllNum }}
                        </template>
                    </div>
                </div>
                <template v-for="(item, index) in userAchievement.perfect" :key="`group-${item.dwID}-${index}`">
                    <img
                        class="u-item__img"
                        :class="perfectItemClass(item)"
                        :style="perfectImageStyle(item, index)"
                        :src="getCdnImgUrl(perfectItemImage(item))"
                    />
                    <component
                        :is="enableDetailLinks ? 'a' : 'div'"
                        class="m-item__text u-treasure-label-link"
                        :class="perfectItemClass(item)"
                        :style="perfectLabelStyle(item)"
                        :href="enableDetailLinks ? getAdventureLink(item) : undefined"
                        :target="enableDetailLinks ? detailTarget : undefined"
                        :rel="enableDetailLinks && detailTarget === '_blank' ? 'noopener noreferrer' : undefined"
                        :aria-label="enableDetailLinks ? item.szName : undefined"
                    >
                        <img class="u-item__bg" :src="getCdnImgUrl(perfectTextBackground(item))" />
                        <span class="u-item__text">{{ item.szName }}</span>
                    </component>
                </template>
            </div>
            <!-- 右侧内容 -->
            <div class="m-title">
                <img class="u-logo" :src="getCdnImgUrl('landscape/title_icon.png')" />
                <div class="m-title-info">
                    <img class="m-tip" :src="getCdnImgUrl('poetry_lan.png')" />
                    <div class="m-user">
                        <img v-if="roleInfo.mount" class="u-icon" :src="showSchoolIcon(roleInfo.mount)" />
                        <span class="u-name">{{ roleInfo.name }}</span>
                    </div>
                </div>
            </div>
            <div class="m-producer">
                <img class="u-producer" :src="getCdnImgUrl('producer.png')" />
                <div class="u-producer__text">{{ $t("pages.adventure.treasure.ui.supportCredit") }}</div>
            </div>
            <div class="m-qy-progress">
                <div class="u-progress">
                    {{
                        $t("pages.adventure.treasure.ui.landscapeProgressText", {
                            value: userAchievement.progress,
                        })
                    }}
                </div>
                <div class="u-time">
                    {{
                        $t("pages.adventure.treasure.ui.landscapeUpdatedAtText", {
                            value: userAchievement.updated_at,
                        })
                    }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { showSchoolIcon } from "@jx3box/jx3box-common/js/utils";
import { __cdn } from "@/utils/config";
import { isPhone } from "@/utils/index";
import {
    getTreasurePerfectItemMap,
    getTreasurePerfectLayout,
    toTreasureCssStyle,
    treasurePerfect,
} from "@/assets/js/treasure/layout.js";
export default {
    name: "landscapeContent",
    props: {
        userAchievement: {
            type: [Object, Boolean],
            default: () => {},
        },
        roleInfo: {
            type: Object,
            default: () => {},
        },
        __imgRoot: {
            type: String,
            required: true,
        },
        addClass: {
            type: Boolean,
            default: false,
        },
        isOver: {
            type: Boolean,
            default: false,
        },
        contentZoom: {
            type: [Number, String],
            default: "",
        },
        currentCamp: {
            type: String,
            default: "hq",
        },
        reelAddClass: {
            type: [Boolean, String],
            default: false,
        },
        enableDetailLinks: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {};
    },
    computed: {
        isLongLocale() {
            return ["en-US", "vi"].includes(this.$i18n.locale);
        },
        detailTarget() {
            return isPhone() ? "_self" : "_blank";
        },
        treasureLayout() {
            return this.userAchievement?.layout || treasurePerfect;
        },
        perfectItemMap() {
            return getTreasurePerfectItemMap(this.treasureLayout);
        },
        perfectLayout() {
            return getTreasurePerfectLayout(this.treasureLayout, "landscape");
        },
        worldStageStyle() {
            const stage = this.perfectLayout.stage || {};
            return {
                width: `${Number(stage.width || 700)}px`,
                height: `${Number(stage.height || 700)}px`,
            };
        },
        worldBgStyle() {
            return toTreasureCssStyle(this.perfectLayout.worldBackground?.style);
        },
        perfectCountStyle() {
            return toTreasureCssStyle(this.perfectLayout.countStyle);
        },
        perfectCountImageStyle() {
            return toTreasureCssStyle(this.perfectLayout.countImageStyle);
        },
        perfectCountTextStyle() {
            return toTreasureCssStyle(this.perfectLayout.countTextStyle);
        },
    },
    methods: {
        showSchoolIcon,
        getCdnImgUrl(img) {
            return `${__cdn}design/treasure/${img}`;
        },
        getAdventureLink(item = {}) {
            const id = Number(item.dwID || item.layout?.id);
            return id ? `/adventure/${id}` : "/adventure";
        },
        perfectItemLayout(item = {}) {
            const baseLayout = item.layout || this.perfectItemMap[Number(item.dwID)] || {};
            const modeLayout = baseLayout.layouts?.landscape || {};
            return {
                ...baseLayout,
                ...modeLayout,
                imageStyle: {
                    ...(baseLayout.imageStyle || {}),
                    ...(modeLayout.imageStyle || {}),
                },
                labelStyle: {
                    ...(baseLayout.labelStyle || {}),
                    ...(modeLayout.labelStyle || {}),
                },
            };
        },
        perfectItemClass(item = {}) {
            return this.perfectItemLayout(item).key || item.hasClass || "";
        },
        perfectImageStyle(item = {}, index = 0) {
            const layout = this.perfectItemLayout(item);
            return {
                ...toTreasureCssStyle(layout.imageStyle),
                zIndex: index,
            };
        },
        perfectLabelStyle(item = {}) {
            return toTreasureCssStyle(this.perfectItemLayout(item).labelStyle);
        },
        perfectItemImage(item = {}) {
            const layout = this.perfectItemLayout(item);
            if (item.isAct && layout.activeImage) return layout.activeImage;
            return layout.image || `world/${item.dwID}${item.isAct ? "_act" : ""}.png`;
        },
        perfectTextBackground(item = {}) {
            return item.isAct ? this.perfectLayout.textActiveBackground : this.perfectLayout.textBackground;
        },
        getImgUrl(item) {
            const client = "std";
            const defaultImg = this.getCdnImgUrl("pt/default.png");
            let tgaPath = item.szOpenRewardPath?.toLowerCase();
            if (!tgaPath) return defaultImg;
            tgaPath = tgaPath.replace(/\\/g, "/").replace("ui/image/adventure/", "");
            if (!item.szRewardType) {
                let pngPath = tgaPath.replace(/\.tga$/, ".png");
                return `${this.__imgRoot}adventure/${client}/${pngPath}`;
            }
            tgaPath = tgaPath.replace(/\/[^\/]+?\.tga$/, "");
            if (item.szRewardType === "camp")
                return `${this.__imgRoot}adventure/${client}/${tgaPath}/camp_${this.currentCamp || "hq"}_open.png`;
            return defaultImg;
        },
    },
};
</script>
<style lang="less">
@import "~@/assets/css/adventure/treasure/pc/landscape.less";
</style>
