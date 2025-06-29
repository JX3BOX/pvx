<template>
    <div class="p-pet-single" v-if="pet" v-loading="loading">
        <template v-if="!isRobot">
            <div class="m-pet-navigation">
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
                            <a class="u-link u-item" :href="getLink('item', item_id)" target="_blank"
                                ><i class="el-icon-collection-tag"></i>物品信息</a
                            >
                            <template v-if="achievement_id">
                                <em> | </em>
                                <a class="u-link u-achievement" :href="getLink('cj', achievement_id)" target="_blank"
                                    ><i class="el-icon-trophy"></i>成就信息</a
                                >
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
                        <img
                            v-for="count in pet.Star"
                            :key="count"
                            class="u-star"
                            src="@/assets/img/star.svg"
                            svg-inline
                        />
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
                            <template v-for="item in getPetDesc(pet.OutputDes)">
                                <span :key="item.text">{{ cleanResourceText(item.text) }}</span>
                            </template>
                        </div>
                        <div class="u-meta u-desc">
                            <span class="u-meta-label">宠物说明：</span>
                            <span class="u-meta-value">
                                <template v-for="(item, index) in getPetDesc(pet.Desc)">
                                    <span :key="index" v-html="item.text"></span>
                                </template>
                            </span>
                        </div>
                    </div>
                    <!-- 宠物技能 -->
                    <div class="m-pet-skills">
                        <div class="u-skill" v-for="(skill, index) in petSkills" :key="index">
                            <el-popover
                                trigger="hover"
                                popper-class="m-pet-skill"
                                :visible-arrow="false"
                                placement="top"
                            >
                                <div class="u-skill-pop">
                                    <div class="u-skill-name">{{ skill.Name }}</div>
                                    <div class="u-skill-desc">{{ skill.Desc }}</div>
                                </div>
                                <img
                                    slot="reference"
                                    class="u-skill-icon"
                                    :src="iconLink(skill.IconID)"
                                    :alt="skill.Name"
                                />
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
                <div class="u-header">
                    <img class="u-icon" svg-inline src="@/assets/img/achievement.svg" />
                    <span class="u-txt">宠物羁绊</span>
                </div>
                <!-- 羁绊信息 -->
                <petFetters :info="item" v-for="item in medalList" :key="item.ID" />
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
                    <img class="u-icon" src="@/assets/img/jx3box_qqbot_pet.svg" />
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
                            <template v-for="item in getPetDesc(pet.OutputDes)">
                                <span :key="item.text">{{ cleanResourceText(item.text) }}</span>
                            </template>
                        </div>
                    </div>
                    <div class="u-info__bottom">
                        <template v-for="(item, index) in getPetDesc(pet.Desc)">
                            <span :key="index" v-html="item.text"></span>
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
// import Wiki from "@/components/wiki/Wiki.vue";
import petType from "@/assets/data/pet_type.json";
import petSource from "@/assets/data/pet_source.json";
import { iconLink, getLink, extractTextContent } from "@jx3box/jx3box-common/js/utils";
import { postStat } from "@jx3box/jx3box-common/js/stat.js";

import dayjs from "@/plugins/day";
import PetMap from "@/components/pet/PetMap.vue";
// import WikiComments from "@jx3box/jx3box-common-ui/src/wiki/WikiComments";
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";
import PvxRobotTip from "@/components/common/PvxRobotTip.vue";
export default {
    name: "PetSingle",
    props: ["isRobot", "sourceId"],
    components: {
        petCard,
        petFetters,
        // Wiki,
        PetMap,
        // WikiComments,
        PvxUser,
        PublicNotice,
        PvxSingleAdminDrop,
        PvxRobotTip,
    },
    data: function () {
        return {
            type: "pet",
            pet: "",
            petSkills: [],
            shopInfo: "",
            luckyList: [],
            medalList: [],
            mapDisplay: false,
            loading: false,
            search: "",
        };
    },
    computed: {
        id: function () {
            return this.$route.params.id || this.sourceId;
        },
        item_id: function () {
            return this.pet?.ItemTabType + "_" + this.pet?.ItemTabIndex;
        },
        achievement_id: function () {
            return this.petWiki?.achievement_id;
        },
        client: function () {
            return this.$store.state.client;
        },
        title: function () {
            return this.pet?.Name || "";
        },
        params: function () {
            return {
                client: this.client,
            };
        },
        robotTitle() {
            let titlePrefix = "宠物";
            return titlePrefix + " · " + this.title;
        },
    },
    watch: {
        id() {
            this.getPetInfo();
        },
    },
    methods: {
        // 显示羁绊介绍
        showPetterDesc: function (str) {
            let result = extractTextContent(str);
            return result?.[0]?.["text"] || "";
        },
        // 获取宠物图片路径
        getImgSrc: function (path) {
            if (path) {
                let img_name = path.match(/.*[\/,\\](.*?).tga/);
                return __imgPath + `pet/pets/${this.client}/` + img_name[1] + ".png";
            }
        },
        replaceByDefault(e) {
            e.target.src = __imgPath + "pet/pets/" + this.client + "/3d_bg.png";
        },
        getScoreClass(score) {
            score = Number(score);
            if (score >= 30) {
                return 2;
            }
            if (score >= 40) {
                return 3;
            }
            if (score >= 50) {
                return 4;
            }
            if (score >= 60) {
                return 5;
            }
            return 1;
        },
        // 获取宠物详情
        getPetInfo: function () {
            this.loading = true;
            getPet(this.id, this.params)
                .then((res) => {
                    this.pet = res.data;
                    this.medalList = res.data.medal_list;
                    this.loadPetSkills(res.data.__skills);
                    this.getShopInfo();
                    this.getPetMedal();
                })
                .finally(() => {
                    this.loading = false;
                    postStat(this.type, this.id);
                });
        },
        // 获取宠物技能信息
        loadPetSkills: function (data) {
            const levelIds = [];
            const skillIds = [];

            this.petSkills = [];

            for (const key in data) {
                // 技能等级
                if (key.startsWith("Level") && data[key]) {
                    levelIds.push(data[key]);
                }
                // 技能id
                if (key.startsWith("SkillID") && data[key]) {
                    skillIds.push(data[key]);
                }
            }

            getSkill({
                ids: skillIds.join(","),
                client: this.client,
            }).then((skillRes) => {
                levelIds.forEach((level, index) => {
                    let skills = skillRes.data.filter((skill) => skill.Level === level);

                    const skill = skills.find((_skill) => _skill.SkillID === skillIds[index]);

                    if (skill) {
                        this.petSkills.push(skill);
                    }
                });
            });
        },
        // 获取宠物商城价格
        getShopInfo() {
            const params = {
                item_type: this.pet.ItemTabType,
                item_id: this.pet.ItemTabIndex,
            };
            getShopInfo(params).then((res) => {
                this.shopInfo = res?.data || "";
            });
        },
        // 获取宠物种类
        getPetType: function (typeId) {
            const _petType = petType.find((item) => item.class === typeId);
            return _petType?.name || "";
        },
        // 获取宠物途径
        getPetSource: function (sourceId) {
            const _petSource = petSource.find((item) => ~~sourceId === ~~item.source);
            return _petSource?.name || "";
        },
        // 获取宠物描述
        getPetDesc: function (str) {
            const regex = /<text>text=(.*?)font=(\d+).*?<\/text>/gimsy;
            let matches = [];
            let match;
            while ((match = regex.exec(str))) {
                matches.push(match);
            }

            // 格式化分段
            let result = [];
            for (let group of matches) {
                result.push({
                    font: ~~group[2],
                    text: group[1].slice(1, -2).replace(/[\\n]/g, ""),
                });
            }
            return result;
        },
        goBack() {
            this.$router.push({ name: "list" });
        },
        goItem() {
            const { ItemTabType, ItemTabIndex } = this.pet;
            const link = getLink("item", `${ItemTabType}_${ItemTabIndex}`);

            window.open(link, "_blank");
        },
        // 获取福缘宠物id
        getPetLucky: function () {
            // 只有正式服有这玩意
            if (this.client === "std")
                getPetLucky(this.client).then((res) => {
                    let data = res.data;
                    let dateIndex = dayjs.tz(new Date()).format("MDD");
                    this.luckyList = data[dateIndex];
                });
        },
        getLink,
        // 获取宠物羁绊的宠物
        getPetMedal() {
            const ids = new Set();
            // 将每个羁绊的宠物id取出来
            this.medalList.forEach((item) => {
                item.pets = [];
                for (const key in item) {
                    if (key.includes("PetIndex") && item[key]) {
                        item.pets = [...item.pets, item[key]];
                        ids.add(item[key]);
                    }
                }
            });
            getPets({ ids: [...ids].join(","), client: this.client }).then((res) => {
                const list = res.data.list;
                // 将羁绊的宠物放入对应的羁绊中
                this.medalList.map((item) => {
                    const petList = list.filter((pet) => item.pets.includes(pet.Index));
                    this.$set(item, "petList", petList);
                    return item;
                });
            });
        },
        mapLoaded(visible) {
            this.mapDisplay = visible;
        },
        goSearch() {
            this.$router.push({ name: "list", params: { search: this.search } });
        },
        iconLink,
        cleanResourceText: function (str) {
            return str && str.startsWith("获取线索：") ? str.replace("获取线索：", "") : str;
        },
    },
    created: function () {
        this.getPetLucky();
    },
    mounted: function () {
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
        gap: 5px;
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
        gap: 4px;

        .u-meta {
            .r(4px);
            background: rgba(89, 89, 89, 1);
            padding: 0 4px;
            font-size: 10px;
            color: #fff;
            height: 15px;
            line-height: 15px;
            box-sizing: border-box;
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
    gap: 10px;
    justify-content: space-between;
    align-items: stretch;
    min-height: 100px;
    .u-logo {
        width: 100px;
        height: auto;
        .r(4px);
        overflow: hidden;
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
        gap: 10px;
        color: #fff;
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
        gap: 4px;
        width: 100%;
    }
    .u-skill {
        .flex;
        align-items: center;
        gap: 4px;
        width: 33.33%;
    }
    .u-skill-info {
        width: calc(100% - 28px);
    }
    .u-skill-icon {
        .size(24px);
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
    }
    .u-fetter-name.is-active {
        color: #fff;
        .bold;
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
