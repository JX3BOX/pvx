<template>
    <div class="p-pet-single" v-if="pet" v-loading="loading">
        <div class="m-pet-navigation">
            <div class="u-goback" @click="goBack">返回列表</div>
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
                    <img v-for="count in pet.Star" :key="count" class="u-star" src="@/assets/img/star.svg" svg-inline />
                    <!-- <i class="el-icon-star-on" v-for="count in pet.Star" :key="count"></i> -->
                </i>
                <div class="u-metas">
                    <div class="u-meta u-number"><span class="u-meta-label">编号：</span>{{ pet.Index }}</div>
                    <div class="u-meta u-type"><span class="u-meta-label">分类：</span>{{ getPetType(pet.Class) }}</div>
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
                        <el-popover trigger="hover" popper-class="m-pet-skill" :visible-arrow="false" placement="top">
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

        <!-- 包含攻略、评论、历史版本、点赞等 书籍，宠物等物品为item, 声望成就等为achievement -->
        <pvx-user :id="item_id" name="宠物" type="item"></pvx-user>

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
// import Wiki from "@/components/wiki/Wiki.vue";
import petType from "@/assets/data/pet_type.json";
import petSource from "@/assets/data/pet_source.json";
import { iconLink, getLink } from "@jx3box/jx3box-common/js/utils";
import { postStat } from "@jx3box/jx3box-common/js/stat.js";

import dayjs from "@/plugins/day";
import PetMap from "@/components/pet/PetMap.vue";
// import WikiComments from "@jx3box/jx3box-common-ui/src/wiki/WikiComments";
export default {
    name: "PetSingle",
    props: [],
    components: {
        petCard,
        petFetters,
        // Wiki,
        PetMap,
        // WikiComments,
        PvxUser,
        PublicNotice,
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
            return this.$route.params.id;
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
            return this.pet?.Name;
        },
        params: function () {
            return {
                client: this.client,
            };
        },
    },
    watch: {
        id() {
            this.getPetInfo();
        },
    },
    methods: {
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
</style>
