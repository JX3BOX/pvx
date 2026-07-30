<template>
    <div class="p-pvx-pet-single" :class="{ 'p-pvx-pet-single--modern': !isRobot }" v-if="pet" v-loading="loading">
        <PvxPageShell v-if="!isRobot" class="m-pvx-pet-single-shell">
            <div class="m-pvx-pet-single-layout">
            <PvxSurface class="m-pvx-pet-navigation" tag="nav" padding="small" radius="medium">
                <PvxActionButton variant="light" @click="goBack">
                    <ArrowLeft />
                    {{ $t("pages.pet.single.ui.actions.back") }}
                </PvxActionButton>
                <PvxSingleAdminDrop />
            </PvxSurface>

            <PvxSurface class="m-pvx-pet-header" tag="header" padding="large">
                <div class="m-pvx-pet-header__info">
                    <div class="m-pvx-pet-header__meta">
                        <span class="u-pvx-pet-eyebrow">
                            {{ $t("pages.pet.single.ui.guideLabel") }}
                        </span>
                        <span class="u-pvx-pet-type">
                            {{ $t("pages.pet.ui.sectionTitle", { type: typeLabel(pet.Class) }) }}
                        </span>
                    </div>
                    <h1 class="u-pvx-pet-title">{{ pet.Name }}</h1>
                </div>
                <div class="m-pvx-pet-header__actions">
                    <PvxActionButton
                        class="u-pvx-pet-action"
                        :href="getLink('item', item_id)"
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="light"
                    >
                        <CollectionTag />
                        {{ $t("pages.pet.single.ui.actions.item") }}
                    </PvxActionButton>
                    <PvxActionButton
                        v-if="achievement_id"
                        class="u-pvx-pet-action"
                        :href="getLink('cj', achievement_id)"
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="light"
                    >
                        <Trophy />
                        {{ $t("pages.pet.single.ui.actions.achievement") }}
                    </PvxActionButton>
                </div>
                <div class="m-pvx-pet-guide-tip">
                    <PvxRobotTip
                        type-name="宠物"
                        :reply="pet.Name"
                        variant="modern"
                        :quick-guide-text="$t('pages.pet.single.ui.robot.quickGuide')"
                        :copy-success-title="$t('pages.pet.single.ui.robot.copySuccess')"
                        :reply-prefix="$t('pages.pet.single.ui.robot.replyPrefix')"
                        :reply-suffix="$t('pages.pet.single.ui.robot.replySuffix')"
                        :copy-qq-label="$t('pages.pet.single.ui.robot.copyQq')"
                        :copy-command-label="$t('pages.pet.single.ui.robot.copyCommand')"
                    />
                </div>
            </PvxSurface>

            <PublicNotice bckey="pet_ac" />

            <PvxSurface
                class="m-pvx-pet-content"
                :class="{ 'has-map': mapDisplay }"
                padding="medium"
            >
                <petCard :petObject="pet" :lucky="luckyList"></petCard>
                <div class="m-pvx-pet-info">
                    <div class="m-pvx-pet-info__summary">
                        <i class="u-stars">
                            <img
                                v-for="count in pet.Star"
                                :key="count"
                                class="u-star"
                                src="@/assets/img/common/star.svg"
                                svg-inline
                            />
                        </i>
                        <div class="m-pvx-pet-shop" v-if="shopInfo.RewardsPrice || shopInfo.CoinPrice">
                            <el-tag class="u-price-item u-rewards" v-if="shopInfo.RewardsPrice > 0">
                                {{ $t("pages.pet.single.ui.price.points") }}<b>{{ shopInfo.RewardsPrice }}</b>
                                <i class="u-icon-rewards"></i>
                            </el-tag>
                            <el-tag class="u-price-item u-coin">
                                {{ $t("pages.pet.single.ui.price.coin") }}<b>{{ shopInfo.CoinPrice }}</b>
                                <i class="u-icon-coin"></i>
                            </el-tag>
                        </div>
                    </div>
                    <div class="u-metas">
                        <div class="u-meta u-number">
                            <span class="u-meta-label">{{ $t("pages.pet.single.ui.fields.id") }}</span>
                            <span>{{ pet.Index }}</span>
                        </div>
                        <div class="u-meta u-type">
                            <span class="u-meta-label">{{ $t("pages.pet.single.ui.fields.type") }}</span>
                            <span>{{ typeLabel(pet.Class) }}</span>
                        </div>
                        <div class="u-meta u-score">
                            <span class="u-meta-label">{{ $t("pages.pet.single.ui.fields.score") }}</span>
                            <span>{{ pet.Score }}</span>
                        </div>
                        <div class="u-meta u-get-way">
                            <span class="u-meta-label">{{ $t("pages.pet.single.ui.fields.source") }}</span>
                            <span>{{ getPetSource(pet.Source) }}</span>
                        </div>
                        <div class="u-meta u-source">
                            <span class="u-meta-label">{{ $t("pages.pet.single.ui.fields.clue") }}</span>
                            <span class="u-meta-value">
                                <template v-for="item in getPetDesc(pet.OutputDes)" :key="item.text">
                                    <span>{{ cleanResourceText(item.text) }}</span>
                                </template>
                            </span>
                        </div>
                        <div class="u-meta u-desc">
                            <span class="u-meta-label">{{ $t("pages.pet.single.ui.fields.description") }}</span>
                            <span class="u-meta-value">
                                <template v-for="(item, index) in getPetDesc(pet.Desc)" :key="index">
                                    <span v-html="item.text"></span>
                                </template>
                            </span>
                        </div>
                    </div>

                    <div v-if="petSkills.length" class="m-pvx-pet-skills-block">
                        <h2>{{ $t("pages.pet.single.ui.sections.skills") }}</h2>
                        <div class="m-pvx-pet-skills">
                            <div class="u-skill" v-for="(skill, index) in petSkills" :key="index">
                                <el-popover trigger="hover" popper-class="m-pvx-pet-skill" :visible-arrow="false"
                                    placement="top">
                                    <div class="u-skill-pop">
                                        <div class="u-skill-name">{{ skill.Name }}</div>
                                        <div class="u-skill-desc">{{ skill.Desc }}</div>
                                    </div>
                                    <template #reference>
                                        <img class="u-skill-icon" :src="iconLink(skill.IconID)" :alt="skill.Name" />
                                    </template>
                                </el-popover>
                            </div>
                        </div>
                    </div>
                </div>
                <section v-show="mapDisplay" class="m-pvx-pet-map-section">
                    <PvxSectionHeader
                        class="m-pvx-pet-section-header"
                        :title="$t('pages.pet.single.ui.sections.map')"
                        :description="$t('pages.pet.single.ui.sections.mapDescription')"
                        level="h2"
                    >
                        <template #icon><Location /></template>
                    </PvxSectionHeader>
                    <div class="m-pvx-pet-map">
                        <pet-map localized :petId="parseInt(id)" @loaded="mapLoaded" />
                    </div>
                </section>
            </PvxSurface>

            <PvxSurface
                v-if="medalList && medalList.length"
                class="m-pvx-pet-fetters"
                padding="medium"
            >
                <PvxSectionHeader
                    class="m-pvx-pet-section-header"
                    :title="$t('pages.pet.single.ui.sections.fetters')"
                    :description="$t('pages.pet.single.ui.sections.fettersDescription')"
                    level="h2"
                >
                    <template #icon><Medal /></template>
                </PvxSectionHeader>
                <petFetters :info="item" v-for="item in medalList" :key="item.ID" />
            </PvxSurface>

            <pvx-user
                class="m-pvx-pet-community"
                :id="item_id"
                :name="$t('pages.pet.single.ui.typeName')"
                type="item"
                :is-robot="false"
                i18n-key-prefix="pages.pet.single.ui.wiki"
            />
            </div>
        </PvxPageShell>
        <template v-else>
            <div class="m-pvx__item m-pvx-pet-robot__header">
                <div class="m-title">
                    <div class="u-title" :class="`u-title--level-${pet.Quality}`">
                        {{ robotTitle }}
                        <i class="u-stars">
                            <i class="el-icon-star-on" v-for="count in pet.Star" :key="count"></i>
                        </i>
                    </div>
                    <div class="m-meta">
                        <div class="u-meta u-score" :class="`u-score--${getScoreClass(pet.Score)}`">
                            {{ pet.Score || 0 }}分
                        </div>
                        <div class="u-meta u-class" :class="`u-class--${pet.Class}`">{{ getPetType(pet.Class) }}</div>
                        <div class="u-meta">ID: {{ id }}</div>
                    </div>
                </div>
                <div class="u-right">
                    <img class="u-icon" src="@/assets/img/qqbot/jx3box_qqbot_pet.svg" />
                </div>
            </div>
            <div class="m-pvx-pet-robot__info">
                <div class="u-logo">
                    <img :src="getImgSrc(pet.BgPath)" class="u-image" @error="replaceByDefault" />
                </div>
                <div class="m-pvx__item u-info">
                    <div class="u-info__top">
                        <div class="u-meta u-get-way">
                            <span class="u-meta-label">获取方式：</span>{{ getPetSource(pet.Source) }}
                        </div>
                        <div class="u-meta u-source">
                            <span class="u-meta-label">获取线索：</span>
                            <template v-for="item in getPetDesc(pet.OutputDes)" :key="item.text">
                                <span>{{ cleanResourceText(item.text) }}</span>
                            </template>
                        </div>
                    </div>
                    <div class="u-info__bottom">
                        <template v-for="(item, index) in getPetDesc(pet.Desc)" :key="index">
                            <span v-html="item.text"></span>
                        </template>
                    </div>
                </div>
            </div>
            <!-- 交互技能 -->
            <!-- <div class="m-pvx__item m-robot__pet-skill">
                <div class="u-title">交互技能</div>
                <div class="m-skills">
                    <div class="u-skill" v-for="(skill, index) in petSkills" :key="index">
                        <img class="u-skill-icon" :src="iconLink(skill.IconID)" :alt="skill.Name" />
                        <div class="u-skill-info">
                            <div class="u-skill-name">{{ skill.Name }}</div>
                            <div class="u-skill-desc">{{ skill.Desc }}</div>
                        </div>
                    </div>
                </div>
            </div> -->
            <!-- 宠物羁绊 -->
            <template v-if="medalList && medalList.length">
                <div class="m-pvx__item m-pvx-pet-robot__fetters" v-for="item in medalList" :key="item.ID">
                    <div class="u-title">羁绊 · {{ item.Name }}</div>
                    <div class="u-desc">{{ showPetterDesc(item.Des) }}</div>
                    <span v-for="pet in item.petList" :key="pet.Index" class="u-fetter" :to="'/' + pet.Index">
                        <i class="u-fetter-icon" :class="['u-quality--' + pet.Quality]">
                            <img :src="iconLink(pet.IconID)" />
                        </i>
                        <span class="u-fetter-name" :class="{ 'is-active': pet.Index == id }">{{ pet.Name }}</span>
                    </span>
                </div>
            </template>
            <div class="m-pvx-pet__map" v-show="mapDisplay">
                <div class="u-title">捕获地图<span>（以魔盒在线版本为准）</span></div>
                <!-- 地图组件 -->
                <pet-map class="m-pvx-pet-robot__map" :petId="parseInt(id)" @loaded="mapLoaded" />
            </div>
        </template>
        <!-- 机器人抓图继续使用旧版百科结构，不进入普通 Web 现代主题。 -->
        <pvx-user v-if="isRobot" :id="item_id" name="宠物" type="item" :is-robot="true"></pvx-user>

        <!-- <div class="m-pet-wiki">
            <Wiki
                source_type="item"
                :source_id="item_id"
                :type="type"
                :id="id"
                title="获取攻略"
                :source_title="title"
            ></Wiki>
        </div>
        <WikiComments :type="type" :source-id="id" /> -->
    </div>
</template>

<script>
import PublicNotice from "@/components/PublicNotice";
import { getPet, getPets, getShopInfo, getSkill, getPetLucky } from "@/service/pet";
import PvxUser from "@/components/PvxUser.vue";
import petCard from "@/components/pet/PetCard.vue";
import petFetters from "@/components/pet/PetFetters.vue";
import PvxSingleAdminDrop from "@/components/common/PvxSingleAdminDrop.vue";
import { iconLink, getLink, extractTextContent } from "@jx3box/jx3box-common/js/utils";
import { postStat } from "@jx3box/jx3box-common/js/stat.js";
import dayjs from "@/plugins/day";
import PetMap from "@/components/pet/PetMap.vue";
import PvxRobotTip from "@/components/common/PvxRobotTip.vue";
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { ArrowLeft, CollectionTag, Location, Medal, Trophy } from "@element-plus/icons-vue";
import {
    getPetImgSrc,
    replacePetImgDefault,
    getPetTypeName,
    getPetSourceName,
    parsePetDesc,
    cleanResourceText as _cleanResourceText,
    getPetScoreClass,
    extractPetSkillIds,
    extractMedalPetIds,
} from "@/utils/pet";

export default {
    name: "PetSingle",
    props: {
        // 是否为机器人模式
        isRobot: {
            type: Boolean,
            default: false
        },
        // 来源ID（机器人模式使用）
        sourceId: {
            type: [String, Number],
            default: ""
        }
    },
    components: {
        petCard,
        petFetters,
        PetMap,
        PvxUser,
        PublicNotice,
        PvxSingleAdminDrop,
        PvxRobotTip,
        PvxActionButton,
        PvxPageShell,
        PvxSectionHeader,
        PvxSurface,
        ArrowLeft,
        CollectionTag,
        Location,
        Medal,
        Trophy,
    },
    data() {
        return {
            type: "pet",           // 数据类型标识
            pet: "",               // 宠物详细信息
            petSkills: [],         // 宠物技能列表
            shopInfo: "",          // 商城价格信息
            luckyList: [],         // 福缘宠物列表
            medalList: [],         // 宠物羁绊列表
            mapDisplay: false,     // 地图是否显示
            loading: false,        // 加载状态
            search: "",            // 搜索关键词
        };
    },
    computed: {
        // 宠物ID（优先从路由参数获取，其次从props获取）
        id() {
            return this.$route.params.id || this.sourceId;
        },
        // 物品ID（用于物品信息链接）
        item_id() {
            if (!this.pet) return "";
            return `${this.pet.ItemTabType}_${this.pet.ItemTabIndex}`;
        },
        // 成就ID（用于成就信息链接）
        achievement_id() {
            return this.pet?.achievement_id || this.pet?.AchievementID || "";
        },
        // 当前客户端类型（正式服/怀旧服）
        client() {
            return this.$store.state.client;
        },
        // 宠物标题（用于页面标题）
        title() {
            return this.pet?.Name || "";
        },
        // API请求参数
        params() {
            return {
                client: this.client,
            };
        },
        // 机器人模式标题
        robotTitle() {
            return "宠物 · " + this.title;
        },
        // 宠物类型名称
        petTypeName() {
            if (!this.pet) return "";
            return getPetTypeName(this.pet.Class);
        },
        // 宠物来源名称
        petSourceName() {
            if (!this.pet) return "";
            return getPetSourceName(this.pet.Source);
        },
    },
    watch: {
        // 监听ID变化，重新加载宠物信息
        id() {
            this.getPetInfo();
        },
    },
    methods: {
        showPetterDesc(str) {
            const result = extractTextContent(str);
            return result?.[0]?.["text"] || "";
        },

        getImgSrc(path) {
            return getPetImgSrc(path, this.client);
        },

        replaceByDefault(e) {
            replacePetImgDefault(e, this.client);
        },

        getScoreClass(score) {
            return getPetScoreClass(score);
        },

        /**
         * 获取宠物详细信息
         * 包括基本信息、技能、商城价格、羁绊信息等
         */
        getPetInfo() {
            this.loading = true;
            getPet(this.id, this.params)
                .then((res) => {
                    this.pet = res.data;
                    this.medalList = res.data.medal_list;
                    this.loadPetSkills(res.data.__skills);
                    this.getShopInfo();
                    this.getPetMedal();
                    // 设置页面标题
                    document.title = `${this.pet.Name}${this.$t("pages.common.appendTitle")}`;
                })
                .finally(() => {
                    this.loading = false;
                    // 记录访问统计
                    postStat(this.type, this.id);
                });
        },

        /**
         * 从技能数据中提取技能ID和等级ID
         * @param {Object} skillData - 技能数据对象
         * @returns {Object} 包含levelIds和skillIds的对象
         */
        loadPetSkills(skillData) {
            this.petSkills = [];
            const { levelIds, skillIds } = extractPetSkillIds(skillData);

            if (skillIds.length === 0) return;

            getSkill({
                ids: skillIds.join(","),
                client: this.client,
            }).then((skillRes) => {
                levelIds.forEach((level, index) => {
                    const matchedSkill = skillRes.data.find(
                        (skill) => skill.Level === level && skill.SkillID === skillIds[index]
                    );
                    if (matchedSkill) {
                        this.petSkills.push(matchedSkill);
                    }
                });
            });
        },

        /**
         * 获取商城价格信息
         * 包括积分价格和通宝价格
         */
        getShopInfo() {
            if (!this.pet) return;
            const params = {
                item_type: this.pet.ItemTabType,
                item_id: this.pet.ItemTabIndex,
            };
            getShopInfo(params).then((res) => {
                this.shopInfo = res?.data || "";
            });
        },

        getPetType(typeId) {
            return getPetTypeName(typeId);
        },

        typeLabel(typeId) {
            return this.$t(`pages.pet.ui.types.${typeId}`);
        },

        getPetSource(sourceId) {
            return getPetSourceName(sourceId);
        },

        getPetDesc(str) {
            return parsePetDesc(str);
        },

        /**
         * 返回宠物列表页
         */
        goBack() {
            this.$router.push({ name: "list" });
        },

        /**
         * 跳转到物品信息页
         */
        goItem() {
            if (!this.pet) return;
            const link = getLink("item", `${this.pet.ItemTabType}_${this.pet.ItemTabIndex}`);
            window.open(link, "_blank");
        },

        /**
         * 获取福缘宠物列表
         * 仅正式服有效
         */
        getPetLucky() {
            if (this.client !== "std") return;

            getPetLucky(this.client).then((res) => {
                const dateIndex = dayjs.tz(new Date()).format("MDD");
                this.luckyList = res.data[dateIndex];
            });
        },

        getPetMedal() {
            if (!this.medalList || this.medalList.length === 0) return;

            const ids = new Set();

            this.medalList.forEach((medalItem) => {
                medalItem.pets = extractMedalPetIds(medalItem);
                medalItem.pets.forEach((petId) => ids.add(petId));
            });

            if (ids.size === 0) return;

            // 批量获取羁绊中的宠物信息
            getPets({ ids: [...ids].join(","), client: this.client }).then((res) => {
                const petList = res.data.list;
                this.medalList.forEach((medalItem) => {
                    medalItem.petList = petList.filter((pet) =>
                        medalItem.pets.includes(pet.Index)
                    );
                });
            });
        },

        /**
         * 地图加载完成回调
         * @param {Boolean} visible - 地图是否可见
         */
        mapLoaded(visible) {
            this.mapDisplay = visible;
        },

        /**
         * 跳转到搜索结果页
         */
        goSearch() {
            this.$router.push({ name: "list", params: { search: this.search } });
        },

        cleanResourceText(str) {
            return _cleanResourceText(str);
        },

        // 工具方法
        getLink,
        iconLink,
    },
    created() {
        this.getPetLucky();
    },
    mounted() {
        this.getPetInfo();
    },
};
</script>

<style lang="less">
@import "~@/assets/css/pet/pc/single.less";
@import "~@/assets/css/pet/pc/map.less";
@import "~@/assets/css/pet/pc/robot.less";
@import "~@/assets/css/modules/pet-detail-theme.less";
</style>
