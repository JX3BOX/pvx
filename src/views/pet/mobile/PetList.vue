<template>
    <div class="m-pet-mobile">
        <PvxSuspension isType='list' type="pet" searchRouter="/search"/>
        <div class="m-pet-tabs__content">
            <div class="u-tab" :class="{ active: active==0 }" @click="toAll">全部</div>
            <div class="u-tab" v-for="item in list_type" :class="{ active: active == item.type }" :key="item.type"
                 @click="changePetType(item)">
                {{ item.name }}
            </div>
        </div>
        <div class="m-pet-list" v-if="active==0">
            <!--        今日福缘-->
            <div class="u-card-title">今日福缘</div>
            <div class="u-lucky">
                <div class="u-lucky-item" v-for="item in luckyList" :key="item.id">
                    <a class="u-pet" :href="getPetLuckLink(item)">
                        <i class="u-img">
                            <img class="u-pic" :src="imgPath(item)" loading="lazy"/>
                        </i>
                    </a>
                </div>
            </div>
            <!--        其他类型-->
            <div v-for="item in list_type" :key="item.type">
                <div class="u-card-title">{{ item.name }}</div>
                <div class="u-list">
                   <div class="u-item" v-for="pet in item.list" :key="pet.id">
                       <a  :href="getPetLink(pet)" >
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
                           <div class="u-desc" v-if="pet.Desc" v-html="renderTextHtml(pet.Desc)"></div>
                       </a>
                   </div>
                </div>
            </div>
        </div>
<!--        单独分类-->
        <div class="m-pet-list" v-else>
            <div class="u-list u-list-all"  @scroll="handleScroll">
                <div class="u-item" v-for="pet in list" :key="pet.id">
                    <a  :href="getPetLink(pet)" >
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
                        <div class="u-desc" v-if="pet.Desc" v-html="renderTextHtml(pet.Desc)"></div>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { __cdn } from "@jx3box/jx3box-common/data/jx3box";
import { extractTextContent, iconLink } from "@jx3box/jx3box-common/js/utils";

import { clone } from "lodash";
import { getPetLucky, getPets, getSliders } from "@/service/pet";
import dayjs from "@/plugins/day";
import PvxSuspension from "@/components/PvxSuspension.vue";

export default {
    name: 'PetMobileList',
    components: { PvxSuspension },
    data() {
        return {
            tabsData:{},
            active:0,
            list: [],
            finished: false,
            page: 1,
            per_page: 12,
            pages: 1,
            total: 0,
            luckyList:[],
            list_type: [
                {
                    class: 1,
                    type: 1,
                    name: "水族",
                    list: [],
                },
                {
                    class: 2,
                    type: 2,
                    name: "禽鸟",
                    list: [],
                },
                {
                    class: 3,
                    type: 3,
                    name: "走兽",
                    list: [],
                },
                {
                    class: 4,
                    type: 4,
                    name: "机关",
                    list: [],
                },]
        };
    },
    computed: {

        client() {
            return this.$store.state.client;
        },
        params({ tabsData }) {
            const _params = {
                ...tabsData,
                page: this.page || 1,
                client: this.client,
            };
            if (this.active) _params.Class = this.active;
            return _params;
        },
    },
    watch: {
        params: {
            deep: true,
            immediate: true,
            handler(val) {
                this.getPetListInit();
            },
        },
    },
    created() {
        this.getPetLucky();
    },
    methods: {
        iconLink,
        imgPath(item) {
            return `${__cdn}design/pet/std/${item.source_id}.png`;
        },
        getPetLuckLink(item) {
            return item.source_id ? `/pet/${item.source_id}` : item.link;
        },
        getPetLink(item) {
            return `/pet/${item.Index}`
        },
        renderTextHtml: function (Text) {
            let result = Text;
            const matches = Text.match(/<Text>(.*?)<\/text>/gims);
            if (!matches) return Text;
            for (let match of matches) {
                let text = extractTextContent(match);
                const html = text[0].text.replace(/\\n/g, "").replace(/\\/g, "");
                result = result.replace(match, html);
            }
            return result;
        },
        toAll(){
            this.active=0;
        },
        changePetType(item) {
            this.active = item.type;
            this.active?this.per_page=20:this.per_page=12;
            this.list = [];
            this.finished=false
            this.page=1;
            this.tabsData = {
                class: item.class,
                type: item.type,
                name: item.name
            };
        },
        setActive(val) {
            this.active = val;
            this.page = 1;
            document.documentElement.scrollTop = 0;
        },

        getPetListInit() {
            if (!this.active) {
                this.showAllList = false;
                this.list_type.forEach((e) => {
                    let params = clone(this.params);
                    params.Class = e.class;
                    params.per = this.per_page;
                    this.getPetList(params);
                });
            } else {
                let params = clone(this.params);
                params.per = this.per_page;
                this.getPetList(params);
            }
        },
        handleScroll(event) {
            const { target } = event;
            if (this.finished ||this.loading) return;
            if (target.scrollHeight - target.scrollTop - 60 < target.clientHeight) {
                this.page=this.page+1;
            }
        },
        // 获取宠物列表
        getPetList: function (params) {
            this.loading = true;
            getPets(params)
                .then((res) => {
                    let newList = res.data.list.filter((item) => {
                        return item.NameFrame || item.Level;
                    });
                    if (this.active) {

                        this.list = this.list.concat(newList);
                        if(this.list.length==this.total)this.finished=true;
                    } else {
                        //分别赋值
                        const typesMap = {
                            1: () => (this.list_type[0].list = newList || []),
                            2: () => (this.list_type[1].list = newList || []),
                            3: () => (this.list_type[2].list = newList || []),
                            4: () => (this.list_type[3].list = newList || []),
                        };
                        typesMap[params.Class]();
                    }
                    if (this.params.Class) {
                        this.total = res.data.total;
                        this.pages = res.data.pages;
                    }
                    this.$forceUpdate();
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        // 获取福缘宠物id
        getPetLucky: function () {
            // 只有正式服有这玩意
            if (this.client === "std")
                getPetLucky(this.client).then((res) => {
                    let data = res.data;
                    let dateIndex = dayjs.tz(new Date()).format("MDD");
                    // this.luckyList = data[dateIndex];
                    getSliders("slider", this.client, data[dateIndex].toString()).then((res) => {
                        this.luckyList = res.data.data.list || [];
                        console.log(this.luckyList);
                    });
                });
        },
    }
}
</script>
<style lang="less">
@import "~@/assets/css/pet/mobileList.less";

.v-miniprogram {
    .m-main {
        padding: 0;
    }
}
</style>
