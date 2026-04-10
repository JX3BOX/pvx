<template>
    <div class="p-pet-single" v-if="pet" v-loading="loading">
        <template v-if="!isRobot">
            <div class="m-pet-navigation m-navigation">
                <div class="u-goback" @click="goBack">返回列表</div>
                <div class="u-back-right">
                    <PvxRobotTip v-if="!isRobot" type-name="宠物" :reply="pet.Name"></PvxRobotTip>
                    <PvxSingleAdminDrop></PvxSingleAdminDrop>
                </div>
            </div>

            <PublicNotice bckey="pet_ac" />
            <div class="m-pet-content flex">
                <petCard :petObject="pet" :lucky="luckyList"></petCard>
                <div class="m-pet-info">
                    <h1 class="u-title">
                        <span class="u-name">{{ pet.Name }}</span>
                        <!-- <span class="u-type">{{ getPetType(pet.Class) }} · {{ getPetSource(pet.Source) }}</span> -->
                        <div class="m-pet-links">
                            <a class="u-link u-item" :href="getLink('item', item_id)" target="_blank"><i
                                    class="el-icon-collection-tag"></i>物品信息</a>
                            <template v-if="achievement_id">
                                <em> | </em>
                                <a class="u-link u-achievement" :href="getLink('cj', achievement_id)" target="_blank"><i
                                        class="el-icon-trophy"></i>成就信息</a>
                            </template>
                        </div>
                        <div class="u-meta u-shop" v-if="shopInfo.RewardsPrice || shopInfo.CoinPrice">
                            <!-- <span class="u-meta-label">商城价格：</span> -->
                            <el-tag class="u-price-item u-rewards" v-if="shopInfo.RewardsPrice > 0">
                                积分<b>{{ shopInfo.RewardsPrice }}</b>
                                <i class="u-icon-rewards"></i>
                            </el-tag>
                            <el-tag class="u-price-item u-coin">
                                通宝<b>{{ shopInfo.CoinPrice }}</b>
                                <i class="u-icon-coin"></i>
                            </el-tag>
                        </div>
                    </h1>
                    <i class="u-stars">
                        <img v-for="count in pet.Star" :key="count" class="u-star" src="@/assets/img/common/star.svg"
                            svg-inline />
                        <!-- <i class="el-icon-star-on" v-for="count in pet.Star" :key="count"></i> -->
                    </i>
                    <div class="u-metas">
                        <div class="u-meta u-number"><span class="u-meta-label">编号：</span>{{ pet.Index }}</div>
                        <div class="u-meta u-type">
                            <span class="u-meta-label">分类：</span>{{ getPetType(pet.Class) }}
                        </div>
                        <div class="u-meta u-score"><span class="u-meta-label">分数：</span>{{ pet.Score }}</div>
                        <div class="u-meta u-get-way">
                            <span class="u-meta-label">获取方式：</span>{{ getPetSource(pet.Source) }}
                        </div>
                        <div class="u-meta u-source">
                            <span class="u-meta-label">获取线索：</span>
                            <template v-for="item in getPetDesc(pet.OutputDes)" :key="item.text">
                                <span>{{ cleanResourceText(item.text) }}</span>
                            </template>
                        </div>
                        <div class="u-meta u-desc">
                            <span class="u-meta-label">宠物说明：</span>
                            <span class="u-meta-value">
                                <template v-for="(item, index) in getPetDesc(pet.Desc)" :key="index">
                                    <span v-html="item.text"></span>
                                </template>
                            </span>
                        </div>
                    </div>
                    <!-- 宠物技能 -->
                    <div class="m-pet-skills">
                        <div class="u-skill" v-for="(skill, index) in petSkills" :key="index">
                            <el-popover trigger="hover" popper-class="m-pet-skill" :visible-arrow="false"
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
                <div class="m-pet-map" v-show="mapDisplay">
                    <span class="u-header"> 捕获地图 </span>
                    <!-- 地图组件 -->
                    <pet-map :petId="parseInt(id)" @loaded="mapLoaded" />
                </div>
            </div>
            <!-- 宠物羁绊 -->
            <div class="m-pet-fetters" v-if="medalList && medalList.length">
                <WikiPanel>
                    <template #head-title>
                        <img class="u-icon" svg-inline src="@/assets/img/common/achievement.svg" />
                        <span class="u-txt">宠物羁绊</span>
                    </template>
                    <template #body>
                        <!-- 羁绊信息 -->
                        <petFetters :info="item" v-for="item in medalList" :key="item.ID" />
                    </template>
                </WikiPanel>
            </div>
            <!-- 宠物地图 -->
            <!-- <div class="u-map-title">捕获地图/获取攻略</div> -->
        </template>
        <template v-else>
            <div class="m-pvx__item m-robot__pet-header">
                <div class="m-title">
                    <div class="u-title" :class="`u-title__level-${pet.Quality}`">
                        {{ robotTitle }}
                        <i class="u-stars">
                            <i class="el-icon-star-on" v-for="count in pet.Star" :key="count"></i>
                        </i>
                    </div>
                    <div class="m-meta">
                        <div class="u-meta u-score" :class="`u-score-${getScoreClass(pet.Score)}`">
                            {{ pet.Score || 0 }}分
                        </div>
                        <div class="u-meta u-class" :class="`u-class-${pet.Class}`">{{ getPetType(pet.Class) }}</div>
                        <div class="u-meta">ID: {{ id }}</div>
                    </div>
                </div>
                <div class="u-right">
                    <img class="u-icon" src="@/assets/img/qqbot/jx3box_qqbot_pet.svg" />
                </div>
            </div>
            <div class="m-robot__pet-info">
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
                <div class="m-pvx__item m-robot-pet__fetters" v-for="item in medalList" :key="item.ID">
                    <div class="u-title">羁绊 · {{ item.Name }}</div>
                    <div class="u-desc">{{ showPetterDesc(item.Des) }}</div>
                    <span v-for="pet in item.petList" :key="pet.Index" class="u-fetter" :to="'/' + pet.Index">
                        <i class="u-fetter-icon" :class="['u-quality-' + pet.Quality]">
                            <img :src="iconLink(pet.IconID)" />
                        </i>
                        <span class="u-fetter-name" :class="{ 'is-active': pet.Index == id }">{{ pet.Name }}</span>
                    </span>
                </div>
            </template>
            <div class="m-pvx-pet__map" v-show="mapDisplay">
                <div class="u-title">捕获地图<span>（以魔盒在线版本为准）</span></div>
                <!-- 地图组件 -->
                <pet-map class="m-robot__map" :petId="parseInt(id)" @loaded="mapLoaded" />
            </div>
        </template>
        <!-- 包含攻略、评论、历史版本、点赞等 书籍，宠物等物品为item, 声望成就等为achievement -->
        <pvx-user :id="item_id" name="宠物" type="item" :is-robot="isRobot"></pvx-user>

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
import { getPet, getPets, getShopInfo, getPetSkill, getSkill, getPetLucky } from "@/service/pet";
import PvxUser from "@/components/PvxUser.vue";
import petCard from "@/components/pet/PetCard.vue";
import petFetters from "@/components/pet/PetFetters.vue";
import PvxSingleAdminDrop from "@/components/common/PvxSingleAdminDrop.vue";
import WikiPanel from "@jx3box/jx3box-ui/src/wiki/WikiPanel";
import petType from "@/assets/data/pet_type.json";
import petSource from "@/assets/data/pet_source.json";
import { iconLink, getLink, extractTextContent } from "@jx3box/jx3box-common/js/utils";
import { postStat } from "@jx3box/jx3box-common/js/stat.js";
import dayjs from "@/plugins/day";
import PetMap from "@/components/pet/PetMap.vue";
import { __imgPath } from "@/utils/config";
import PvxRobotTip from "@/components/common/PvxRobotTip.vue";

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
        WikiPanel,
        PetMap,
        PvxUser,
        PublicNotice,
        PvxSingleAdminDrop,
        PvxRobotTip,
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
            return this.petWiki?.achievement_id;
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
            return this.findDataName(petType, "class", this.pet.Class);
        },
        // 宠物来源名称
        petSourceName() {
            if (!this.pet) return "";
            return this.findDataName(petSource, "source", this.pet.Source, true);
        },
    },
    watch: {
        // 监听ID变化，重新加载宠物信息
        id() {
            this.getPetInfo();
        },
    },
    methods: {
        /**
         * 从数据列表中查找对应的名称
         * @param {Array} dataList - 数据列表
         * @param {String} key - 查找的键名
         * @param {*} value - 查找的值
         * @param {Boolean} useNumberConversion - 是否转换为数字比较
         * @returns {String} 找到的名称，未找到返回空字符串
         */
        findDataName(dataList, key, value, useNumberConversion = false) {
            const item = dataList.find((item) => {
                const itemValue = useNumberConversion ? ~~item[key] : item[key];
                const compareValue = useNumberConversion ? ~~value : value;
                return itemValue === compareValue;
            });
            return item?.name || "";
        },

        /**
         * 显示宠物羁绊描述（提取纯文本）
         * @param {String} str - 包含HTML标签的描述文本
         * @returns {String} 提取后的纯文本
         */
        showPetterDesc(str) {
            const result = extractTextContent(str);
            return result?.[0]?.["text"] || "";
        },

        /**
         * 获取宠物图片路径
         * @param {String} path - 原始路径（包含.tga后缀）
         * @returns {String} 转换后的PNG图片路径
         */
        getImgSrc(path) {
            if (!path) return "";
            const imgName = path.match(/.*[\/,\\](.*?).tga/);
            return imgName ? `${__imgPath}pet/pets/${this.client}/${imgName[1]}.png` : "";
        },

        /**
         * 图片加载失败时替换为默认图片
         * @param {Event} e - 错误事件对象
         */
        replaceByDefault(e) {
            e.target.src = `${__imgPath}pet/pets/${this.client}/3d_bg.png`;
        },

        /**
         * 根据分数获取对应的等级分类
         * @param {Number} score - 宠物分数
         * @returns {Number} 等级（1-5）
         */
        getScoreClass(score) {
            const scoreNum = Number(score);
            if (scoreNum >= 60) return 5;
            if (scoreNum >= 50) return 4;
            if (scoreNum >= 40) return 3;
            if (scoreNum >= 30) return 2;
            return 1;
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
        extractSkillIds(skillData) {
            const levelIds = [];
            const skillIds = [];

            for (const key in skillData) {
                if (key.startsWith("Level") && skillData[key]) {
                    levelIds.push(skillData[key]);
                }
                if (key.startsWith("SkillID") && skillData[key]) {
                    skillIds.push(skillData[key]);
                }
            }

            return { levelIds, skillIds };
        },

        /**
         * 加载宠物技能列表
         * @param {Object} skillData - 技能数据对象
         */
        loadPetSkills(skillData) {
            this.petSkills = [];
            const { levelIds, skillIds } = this.extractSkillIds(skillData);

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

        /**
         * 获取宠物类型名称
         * @param {Number} typeId - 类型ID
         * @returns {String} 类型名称
         */
        getPetType(typeId) {
            return this.findDataName(petType, "class", typeId);
        },

        /**
         * 获取宠物来源名称
         * @param {Number} sourceId - 来源ID
         * @returns {String} 来源名称
         */
        getPetSource(sourceId) {
            return this.findDataName(petSource, "source", sourceId, true);
        },

        /**
         * 解析宠物描述文本
         * 从XML格式的文本中提取内容和字体信息
         * @param {String} str - XML格式的描述文本
         * @returns {Array} 包含font和text属性的对象数组
         */
        getPetDesc(str) {
            if (!str) return [];

            const regex = /<text>text=(.*?)font=(\d+).*?<\/text>/gimsy;
            const matches = [];
            let match;

            while ((match = regex.exec(str)) !== null) {
                matches.push({
                    font: ~~match[2],
                    text: match[1].slice(1, -2).replace(/[\\n]/g, ""),
                });
            }

            return matches;
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

        /**
         * 从羁绊数据中提取宠物ID列表
         * @param {Object} medalItem - 羁绊数据对象
         * @returns {Array} 宠物ID数组
         */
        extractMedalPetIds(medalItem) {
            const petIds = [];
            for (const key in medalItem) {
                if (key.includes("PetIndex") && medalItem[key]) {
                    petIds.push(medalItem[key]);
                }
            }
            return petIds;
        },

        /**
         * 获取宠物羁绊信息
         * 包括羁绊中所有宠物的详细信息
         */
        getPetMedal() {
            if (!this.medalList || this.medalList.length === 0) return;

            const ids = new Set();

            this.medalList.forEach((medalItem) => {
                medalItem.pets = this.extractMedalPetIds(medalItem);
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

        /**
         * 清理资源文本中的前缀
         * @param {String} str - 原始文本
         * @returns {String} 清理后的文本
         */
        cleanResourceText(str) {
            return str && str.startsWith("获取线索：") ? str.replace("获取线索：", "") : str;
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
@import "~@/assets/css/pet/single.less";
@import "~@/assets/css/pet/map.less";

.m-robot__pet-header {
    .flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 75px;
    opacity: 1;

    .u-stars {
        color: rgba(255, 195, 0, 1);
        font-size: 14px;
    }

    .u-title {
        font-size: 20px;
        .bold;
        color: #fff;
        .flex;
        align-items: center;

        i {
            margin-right: 5px;

            &:last-child {
                margin-right: 0;
            }
        }

        &.u-title__level-2 {
            color: rgba(13, 192, 63, 1);
        }

        &.u-title__level-3 {
            color: rgba(0, 133, 255, 1);
        }

        &.u-title__level-4 {
            color: rgba(204, 70, 237, 1);
        }

        &.u-title__level-5 {
            color: rgba(255, 168, 17, 1);
        }
    }

    .m-meta {
        margin-top: 4px;
        .flex;
        flex-wrap: wrap;
        align-items: center;

        .u-meta {
            .r(4px);
            background: rgba(89, 89, 89, 1);
            padding: 0 4px;
            font-size: 10px;
            color: #fff;
            height: 15px;
            line-height: 15px;
            box-sizing: border-box;
            margin-right: 4px;
            margin-bottom: 4px;

            &.u-class-1,
            &.u-score-3 {
                background: rgba(55, 78, 105, 1);
                color: rgba(94, 199, 255, 1);
            }

            &.u-class-2,
            &.u-score-2 {
                background: rgba(72, 94, 79, 1);
                color: rgba(79, 255, 138, 1);
            }

            &.u-class-3 {
                background: rgba(77, 39, 39, 1);
                color: rgba(255, 115, 115, 1);
            }

            &.u-score-4 {
                background: rgba(62, 52, 87, 1);
                color: rgba(185, 156, 255, 1);
            }

            &.u-class-4,
            &.u-score-5 {
                background: rgba(102, 85, 53, 1);
                color: rgba(255, 195, 0, 1);
            }
        }
    }
}

.m-robot__pet-info {
    margin-top: 10px;
    .flex;
    justify-content: space-between;
    align-items: stretch;
    min-height: 100px;

    .u-logo {
        width: 100px;
        height: auto;
        .r(4px);
        overflow: hidden;
        margin-right: 10px;

        .u-image {
            .size(100px, 100px);
            object-fit: cover;
            .r(4px);
            .db;
        }
    }

    .u-info {
        flex: 1;
    }

    .u-info__top {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        color: #fff;

        .u-meta {
            margin-bottom: 10px;

            &:nth-child(odd) {
                margin-right: 10px;
            }
        }
    }

    .u-info__bottom {
        margin-top: 4px;
    }
}

.m-robot__pet-skill {
    margin-top: 10px;

    .u-title {
        color: rgba(92, 236, 255, 1);
        font-size: 12px;
        margin-bottom: 8px;
    }

    .m-skills {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        margin-right: -4px;
        margin-bottom: -4px;
    }

    .u-skill {
        .flex;
        align-items: center;
        width: 33.33%;
        margin-bottom: 4px;
        padding-right: 4px;
        box-sizing: border-box;
    }

    .u-skill-info {
        width: calc(100% - 28px);
    }

    .u-skill-icon {
        .size(24px);
        margin-right: 4px;
    }

    .u-skill-name {
        color: #fff;
    }

    .u-skill-desc {
        color: rgba(255, 255, 255, 0.5);
        width: 100%;
        .nobreak;
    }
}

.m-robot-pet__fetters {
    margin-top: 10px;

    .u-title {
        color: rgba(255, 195, 0, 1);
        font-size: 12px;
    }

    .u-desc {
        margin: 4px 0;
    }

    .u-fetter {
        display: inline-flex;
        flex-direction: column;
        margin-right: 4px;
    }

    .u-fetter-icon {
        .size(36px);
        border: 1px solid transparent;
        box-sizing: border-box;
        .r(4px);
        overflow: hidden;

        &.u-quality-2 {
            border-color: rgba(13, 192, 63, 1);
        }

        &.u-quality-3 {
            border-color: rgba(0, 133, 255, 1);
        }

        &.u-quality-4 {
            border-color: rgba(204, 70, 237, 1);
        }

        &.u-quality-5 {
            border-color: rgba(255, 168, 17, 1);
        }
    }

    .u-fetter-name {
        text-align: center;

        &.is-active {
            color: #fff;
            .bold;
        }
    }
}

.m-pvx-pet__map {
    margin-top: 10px;

    .u-title {
        font-size: 16px;
        color: #fff;
        .bold;

        span {
            .normal;
            color: rgba(#fff, 0.5);
            font-size: 12px;
        }
    }

    .m-robot__map {
        margin-top: -10px;
        margin-bottom: -15px;
        border-radius: 8px;
        overflow: hidden;

        .c-map,
        .u-map__wrapper {
            .r(8px) !important;
        }

        .u-map__inner {
            border: none !important;
            box-shadow: none !important;
        }
    }
}
</style>
