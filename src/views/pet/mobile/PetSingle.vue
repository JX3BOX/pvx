<template>
    <div class="m-pet-mobile_single">
        <PvxSuspension isType='single' type="pet" :id="id" :title="pet.Name" searchRouter="/search"
                     />
<!--        顶部卡片-->
        <div class="m-pet-card m-top">
            <div class="u-icon-name">
                <div class="u-icon">
                    <el-image :src="iconLink(pet.IconID, client)" fit="fit"></el-image>
                </div>
                <div class="u-name">
                    {{ pet.Name }}
                    <div class="u-rate">
                        <img
                            v-for="o in pet.Star"
                            :key="o"
                            class="u-star"
                            src="../../../assets/img/star.svg"
                            svg-inline
                        />
                    </div>
                </div>
            </div>
            <div class="u-info-box">
                <div class="u-content">
                    <div class="u-label">编号</div>
                    <div class="u-text">{{  pet.Index }}</div>
                </div>
                <div class="u-content">
                    <div class="u-label">分数</div>
                    <div class="u-text">{{ pet.Score }}</div>
                </div>
                <div class="u-content">
                    <div class="u-label">分类</div>
                    <div class="u-text">{{ getPetType(pet.Class) }}</div>
                </div>
                <div class="u-content">
                    <div class="u-label">获取方式</div>
                    <div class="u-text">{{ getPetSource(pet.Source) }}</div>
                </div>
                <div class="u-content w-100">
                    <div class="u-label">获取线索</div>
                    <div class="u-text">
                        <template v-for="item in getPetDesc(pet.OutputDes)">
                            <span :key="item.text">{{ cleanResourceText(item.text) }}</span>
                        </template>
                    </div>
                </div>
                <div class="u-content  w-100">
                    <div class="u-label">宠物说明</div>
                    <div class="u-text">
                        <template v-for="(item, index) in getPetDesc(pet.Desc)">
                            <span :key="index" v-html="item.text"></span>
                        </template>
                    </div>
                </div>
                <div class="u-content  w-100 u-pet-skill">
                    <div class="u-label">宠物招式</div>
                    <div class="u-skill-list">
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
            </div>

        </div>

<!--        <pvx-user :id="item_id" name="宠物" type="item"></pvx-user>-->
        <PvxUserMiniprogram :id="item_id" name="宠物" type="item"></PvxUserMiniprogram>
    </div>
</template>
<script>
import { getPet, getPets, getShopInfo, getPetSkill, getSkill, getPetLucky } from "@/service/pet";
import petType from "@/assets/data/pet_type.json";
import petSource from "@/assets/data/pet_source.json";
import { iconLink } from "@jx3box/jx3box-common/js/utils";
import PvxUserMiniprogram from "@/components/PvxUserMiniprogram.vue";
import PvxSuspension from "@/components/PvxSuspension.vue";


export default {
    name: 'PetMobileSingle',
    components: { PvxSuspension, PvxUserMiniprogram },
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

    },
    created() {
        this.getPetInfo();
    },
    mounted() {

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
                    // this.getPetMedal();
                })
                .finally(() => {
                    this.loading = false;

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
        iconLink,
        cleanResourceText: function (str) {
            return str && str.startsWith("获取线索：") ? str.replace("获取线索：", "") : str;
        },
    }
}
</script>
<style lang="less">
@import "~@/assets/css/pet/mobileSingle.less";
.v-miniprogram {
    .m-main {
        padding: 0;
    }
}
</style>
